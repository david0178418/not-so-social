import { ObjectId } from 'mongodb';
import { URL_PATTERN } from 'interweave-autolink';

import { PostSaveSchema } from '@common/types';
import { getCollection } from '@server/mongodb';
import { grammit } from '@server/server-utils';
import { dbPostToDbAttachmentPostPartial, dbPostToDbParentPostPartial } from '@server/transforms';
import { fetchDbPost, fetchDbPosts } from '@server/queries';
import { isTruthy } from '@common/utils';
import {
	DbPost,
	DbPostTextGram,
	DbExternalLinkPreviewData,
	DbLinkPreview,
} from '@server/db-schema';
import {
	DbCollections,
	OwnPostRatio,
	PointTransactionTypes,
} from '@common/constants';

const UrlRegex = new RegExp(URL_PATTERN, 'gi');

export
async function createPost(content: PostSaveSchema, ownerId: ObjectId, isAdmin = false) {
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
		linkPreviews = [],
		...newPostContent
	} = content;
	const appliedPoints = Math.floor(OwnPostRatio * spentPoints);
	const newPostId = new ObjectId();
	// only attach valid posts
	const postPreviewIds = linkPreviews
		.map(l => l.postId)
		.filter(isTruthy);

	const fetchedPostPreviews = postPreviewIds.length ?
		await fetchDbPosts(postPreviewIds) :
		[];

	const completeLinkPreviews: DbLinkPreview[] = linkPreviews
		.map((p): DbLinkPreview | null => {
			if(p.type === 'link') {
				return {
					link: p.link as DbExternalLinkPreviewData,
					type: p.type,
					annotation: p.annotation,
				};
			}
			const foundPost = fetchedPostPreviews?.find(post => post._id?.equals(p.postId || ''));

			if(!foundPost) {
				return null;
			}

			return {
				post: dbPostToDbAttachmentPostPartial(foundPost),
				type: p.type,
				annotation: p.annotation,
			};
		})
		.filter(isTruthy);

	const newPost: DbPost = {
		...newPostContent,
		created: nowIsoStr,
		lastUpdated: nowIsoStr,
		linkPreviews: completeLinkPreviews,
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
		const parent = await fetchDbPost(parentId);
		if(parent) {
			newPost.parent = dbPostToDbParentPostPartial(parent);
		}
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
		...completeLinkPreviews
			.map(a => {
				if(a.type === 'link') {
					return null;
				}

				return postCol.updateOne(
					{ _id: a.post._id },
					{ $push: { attachedToPosts: dbPostToDbParentPostPartial(newPost) } }
				);
			})
			.filter(isTruthy),
	];

	if(!isAdmin) {
		calls.push(
			usersCol
				.updateOne({ _id: ownerId }, { $inc: { pointBalance: -spentPoints } })
		);
	}

	if(newPost.parent) {
		calls.push(
			postCol.updateOne(
				{ _id: newPost.parent._id },
				{ $inc: { replyCount: 1 } }
			)
		);
	}

	await Promise.all(calls);

	return newPostId;
}
