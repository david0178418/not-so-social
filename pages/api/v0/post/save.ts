import type { NextApiRequest, NextApiResponse } from 'next';

import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from '@common/server/auth-options';
import { fetchDbPosts, fetchUserBalance } from '@common/server/queries';
import { grammit } from '@common/server/server-utils';
import { LinkPreviewData } from '@common/types';
import { z, ZodType } from 'zod';
import { linkPreviewSchema, MongoObjectId } from '@common/server/validations';
import { URL_PATTERN } from 'interweave-autolink';
import {
	DbPost,
	DbAttachment,
	DbPostTextGram,
} from '@common/server/db-schema';
import {
	DbCollections,
	MaxPostAttachmentAnnotationLength,
	MaxPostBodyLength,
	MaxPostCost,
	MaxPostTitleLength,
	MinPostBodyLength,
	MinPostCost,
	MinPostTitleLength,
	NotLoggedInErrMsg,
	OwnPostRatio,
	PointTransactionTypes,
	UserRoles,
} from '@common/constants';
import { dbPostToDbAttachmentPostPartial } from '@common/server/transforms';

const UrlRegex = new RegExp(URL_PATTERN, 'gi');

interface AttachmentIds {
	annotation: string;
	postId: string;
}

interface Schema {
	attachments?: AttachmentIds[];
	body: string;
	title: string;
	points: number;
	parentId?: string;
	linkPreviews?: LinkPreviewData[];
}

const schema: ZodType<Schema> = z.object({
	attachments: z
		.array(
			z.object({
				annotation: z
					.string()
					.max(MaxPostAttachmentAnnotationLength, { message: `Annotation may not be more than ${MaxPostAttachmentAnnotationLength} characters long` }),
				postId: MongoObjectId,
			})
		)
		.optional(),
	body: z
		.string()
		.min(MinPostBodyLength, { message: `Post body must be at least ${MinPostBodyLength} characters long.` })
		.max(MaxPostBodyLength, { message: `Post body can be no more than ${MaxPostBodyLength} characters long.` }),
	title: z
		.string()
		.min(MinPostTitleLength, { message: `Post title must be at least ${MinPostTitleLength} characters long.` })
		.max(MaxPostTitleLength, { message: `Post title can be no more than ${MaxPostTitleLength} characters long.` }),
	points: z
		.number()
		.min(MinPostCost, { message: `Must spend at least ${MinPostCost} points` })
		.max(MaxPostCost, { message: `Can't spend more than  ${MaxPostCost} points` }),
	linkPreviews: z
		.array(linkPreviewSchema)
		.optional(),
	nsfw: z
		.boolean()
		.optional(),
	nsfl: z
		.boolean()
		.optional(),
	parentId: MongoObjectId
		.optional(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	const result = await schema.safeParseAsync(req.body);

	if(!result.success) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: result.error.errors.map(e => e.message),
			});
	}

	const postContent = result.data;
	const ownerId = new ObjectId(user.id);
	const balance = await fetchUserBalance(ownerId);
	const isAdmin = user.role === UserRoles.Admin;

	if(
		!isAdmin &&
		postContent.points > balance
	) {
		return res.send({
			ok: false,
			errors: [
				`Not enough points. Current balance: ${balance}`,
			],
		});
	}

	res.send({
		ok: true,
		data: { id: await createPost(postContent, ownerId, isAdmin) },
	});
}

async function createPost(content: Schema, ownerId: ObjectId, isAdmin = false) {
	const [
		gramCol,
		postCol,
	] = await Promise.all([
		getCollection(DbCollections.Grams),
		getCollection(DbCollections.Posts),
	]);

	const nowDate = new Date();
	const nowIsoStr = nowDate.toISOString();
	const {
		parentId,
		points: spentPoints,
		attachments,
		...newPostContent
	} = content;
	const appliedPoints = Math.floor(OwnPostRatio * spentPoints);
	const newPostId = new ObjectId();
	// only attach valid posts
	const fetchedAttachedPosts = attachments ?
		await fetchDbPosts(attachments.map(a => a.postId)) :
		[];

	const attachedPosts: DbAttachment[] = fetchedAttachedPosts.map(post => ({
		annotation: attachments?.find(a => post._id?.equals(a.postId))?.annotation || '',
		post: dbPostToDbAttachmentPostPartial(post),
	}));

	const newPost: DbPost = {
		...newPostContent,
		attachedPosts,
		created: nowIsoStr,
		lastUpdated: nowIsoStr,
		ownerId,
		replyCount: 0,
		totalPoints: appliedPoints,
		_id: newPostId,
	};

	const newPostGram: DbPostTextGram = {
		postId: newPostId,
		// clean urls before grams are created
		grams: grammit(`${newPostContent.title} ${newPostContent.body}`.replaceAll(UrlRegex, '')),
	};

	if(parentId) {
		newPost.parentId = new ObjectId(parentId);
	}

	const [
		usersCol,
		pointPostCol,
	] = await Promise.all([
		getCollection(DbCollections.Users),
		getCollection(DbCollections.PointTransactions),
	]);

	const calls: Promise<any>[] = [
		postCol.insertOne(newPost),
		gramCol.insertOne(newPostGram),
		pointPostCol
			.insertOne({
				type: PointTransactionTypes.PostCreate,
				data: {
					userId: ownerId,
					postId: newPostId,
					spentPoints,
				},
				date: nowDate,
				points: appliedPoints,
			}),
	];

	if(!isAdmin) {
		calls.push(
			usersCol
				.updateOne({ _id: ownerId }, { $inc: { pointBalance: -spentPoints } })
		);
	}

	if(newPost.parentId) {
		calls.push(
			postCol.updateOne(
				{ _id: newPost.parentId },
				{ $inc: { replyCount: 1 } }
			)
		);
	}

	await Promise.all(calls);

	return newPostId;
}
