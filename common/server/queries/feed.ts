import { getCollection } from '@common/server/mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import { ObjectId } from 'mongodb';
import { DbCollections } from '@common/constants';
import {
	isTruthy,
	unique,
} from '@common/utils';
import {
	dbPostToPostFn,
	postToBookmarkedPostFn,
	postListsToIdList,
	rollupPostsToMapFn,
} from '@common/server/transforms';
import {
	fetchBookmarksFromPostIds,
	fetchPosts,
	fetchTopChildPosts,
} from '.';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';
const PageLimit = 3;

export
async function fetchFeed(type: keyof typeof Aggregations, userId: string, cutoffDate = '') {
	const results = await Aggregations[type](cutoffDate || userId);
	const posts = results.map(dbPostToPostFn(userId));

	const parentIds = unique(posts.map(p => p.parentId).filter(isTruthy));
	const postIds = posts.map(p => p._id) as string[];

	const parentPosts = await fetchPosts(parentIds, userId);
	const responsePosts = await fetchTopChildPosts(postIds, userId);
	const allIds = postListsToIdList(posts, parentPosts, responsePosts);

	const postToBookmarkedPost = postToBookmarkedPostFn(
		await fetchBookmarksFromPostIds(userId, allIds)
	);

	return {
		posts: posts.map(postToBookmarkedPost),
		parentPostMap: parentPosts
			.map(postToBookmarkedPost)
			.reduce(rollupPostsToMapFn(), {}),
		responsePostMap: responsePosts
			.map(postToBookmarkedPost)
			.reduce(rollupPostsToMapFn('parentId'), {}),
	};
}

const Aggregations = {
	new: getNewPosts,
	top: getTopPosts,
	bookmarks: getBookmarkedPosts,
	hot: getHotPosts,
};

async function getNewPosts() {
	const col = await getCollection(DbCollections.Posts);

	return col.aggregate<DbPost>([{ $sort: { created: -1 } }]).toArray();
}

async function getTopPosts() {
	const col = await getCollection(DbCollections.Posts);

	return col.aggregate<DbPost>([
		{ $sort: { totalPoints: -1 } },
		// { $match: { created: { $gt: cutoffDate } } },
	]).toArray();
}

async function getBookmarkedPosts(userId: string) {
	const col = await getCollection(DbCollections.PostBookmarks);

	return col.aggregate<DbPost>([
		{ $match: { userId: new ObjectId(userId) } },
		{ $sort: { date: -1 } },
		{
			$lookup: {
				from: DbCollections.Posts,
				localField: 'postId',
				foreignField: '_id',
				as: DocPlaceholder,
			},
		},
		{ $unwind: { path: `$${DocPlaceholder}` } },
		{ $replaceRoot: { newRoot: `$${DocPlaceholder}` } },
	]).toArray();
}

async function getHotPosts() {
	const txnCol = await getCollection(DbCollections.PointTransactions);

	const txnAgg = await txnCol.aggregate<DbPointTransaction>([
		{ $sort: { date: -1 } },
	]);

	const pointRollup: Record<string, number> = {};

	while(await txnAgg.hasNext()) {
		const doc = await txnAgg.next();

		if(!doc?.postId) {
			continue;
		}

		const postId = doc.postId.toString();

		if(!pointRollup[postId]) {
			if(Object.keys(pointRollup).length === PageLimit) {
				break;
			}

			pointRollup[postId] = 0;
		}

		pointRollup[postId] = pointRollup[postId] + doc.appliedPoints;
	}

	const postIds = Object.keys(pointRollup).sort((idA, idB) => pointRollup[idA] - pointRollup[idB]);

	const col = await getCollection(DbCollections.Posts);

	return col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();
}
