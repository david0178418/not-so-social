import { ObjectId } from 'mongodb';
import { URL_PATTERN } from 'interweave-autolink';

import { getCollection } from '@server/mongodb';
import { grammit } from '@server/server-utils';
import { PostSaveSchema } from './post-save.validation';
import { dbPostToDbAttachmentPostPartial, dbPostToDbParentPostPartial } from '@server/transforms';
import { fetchDbPost, fetchDbPosts } from '@server/queries';
import {
	DbPost,
	DbAttachment,
	DbPostTextGram,
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
		...attachedPosts.map(a => (
			postCol.updateOne(
				{ _id: a.post._id },
				{
					$push: {
						attachedToPosts: {
							...a,
							post: dbPostToDbAttachmentPostPartial(newPost),
						},
					},
				}
			)
		)),
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
