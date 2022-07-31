import type { NextApiRequest, NextApiResponse } from 'next';

import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPost, DbPostTextGram } from '@common/server/db-schema';
import { getServerSession } from '@common/server/auth-options';
import { fetchUserBalance } from '@common/server/queries';
import { grammit } from '@common/server/server-utils';
import { LinkPreviewData } from '@common/types';
import { z, ZodType } from 'zod';
import { linkPreviewSchema, MongoObjectId } from '@common/server/validations';
import {
	DbCollections,
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

interface Schema {
	body: string;
	title: string;
	points: number;
	parentId?: string;
	linkPreviews?: LinkPreviewData[];
}

const schema: ZodType<Schema> = z.object({
	body: z
		.string()
		.min(MinPostBodyLength)
		.max(MaxPostBodyLength),
	title: z
		.string()
		.min(MinPostTitleLength)
		.max(MaxPostTitleLength),
	points: z
		.number()
		.min(MinPostCost, { message: `Must spend at least ${MinPostCost} points` })
		.max(MaxPostCost),
	linkPreviews: z
		.array(linkPreviewSchema)
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

interface PostContent {
	title: string;
	body: string;
	points: number;
	parentId?: string;
}

async function createPost(content: PostContent, ownerId: ObjectId, isAdmin = false) {
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
		...newPostContent
	} = content;
	const appliedPoints = Math.floor(OwnPostRatio * spentPoints);
	const newPostId = new ObjectId();
	const newPost: DbPost = {
		...newPostContent,
		created: nowIsoStr,
		lastUpdated: nowIsoStr,
		ownerId,
		replyCount: 0,
		totalPoints: appliedPoints,
		_id: newPostId,
	};

	const newPostGram: DbPostTextGram = {
		postId: newPostId,
		grams: grammit(`${newPostContent.title} ${newPostContent.body}`),
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
