import { Post, PostIdMap } from '@common/types';
import { getCollection } from '../mongodb';
import { DbPost } from '../db-schema';
import {
	DbCollections,
	PointTransactionTypes,
} from '@common/constants';
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

interface GetPostsReturn {
	parentPostMap: PostIdMap;
	posts: Post[];
	responsePostMap: PostIdMap;
}

// TODO Is there a better way to do this in MongoDB
const DOC_PLACEHOLDER = 'docTemp';

const Sorts = {
	new: () => ({
		baseCollection: DbCollections.Posts,
		pipeline: [{ $sort: { created: -1 } }],
	}),
	top: (cutoffDate: string) => ({
		baseCollection: DbCollections.Posts,
		pipeline: [
			{ $sort: { totalPoints: -1 } },
			{ $match: { created: { $gt: cutoffDate } } },
		],
	}),
	hot: (cutoffDate: string) => ({
		baseCollection: DbCollections.PointTransactions,
		pipeline: [
			{
				$match: {
					type: PointTransactionTypes.postBoost,
					date: { $gte: cutoffDate },
				},
			},
			{
				$group: {
					_id: '$toId',
					points: { $sum: '$appliedPoints' },
				},
			},
			{
				$lookup: {
					from: DbCollections.Posts,
					localField: '_id',
					foreignField: '_id',
					as: DOC_PLACEHOLDER,
				},
			},
			{ $unwind: { path: `$${DOC_PLACEHOLDER}` } },
			{
				$replaceWith: {
					$mergeObjects: [
						`$${DOC_PLACEHOLDER}`,
						{ points: '$points' },
					],
				},
			},
			{ $sort: { points: -1 } },
		],
	}),
};

export
async function fetchFeed(type: keyof typeof Sorts, userId: string, cutoffDate = '') {
	console.log('cutoffDate', cutoffDate);
	const {
		baseCollection,
		pipeline,
	} = Sorts[type](cutoffDate);
	const col = await getCollection(baseCollection);
	const results = await col.aggregate<DbPost>(pipeline).toArray();
	const posts = results.map(dbPostToPostFn(userId));

	return Fooo(posts, userId);
}

export
async function fetchUserBookmarkedPosts(userId: string): Promise<GetPostsReturn> {
	const col = await getCollection(DbCollections.PostBookmarks);

	const results = await col.aggregate<DbPost>([
		{ $match: { userId } },
		{ $sort: { date: -1 } },
		{
			$lookup: {
				from: DbCollections.Posts,
				localField: 'postId',
				foreignField: '_id',
				as: DOC_PLACEHOLDER,
			},
		},
		{ $unwind: { path: `$${DOC_PLACEHOLDER}` } },
		{ $replaceRoot: { newRoot: `$${DOC_PLACEHOLDER}` } },
	]).toArray();

	const posts = results.map(dbPostToPostFn(userId));

	return Fooo(posts, userId);
}

// TODO Reorg this code commong to landing page, bookmarks, and probably others
async function Fooo(posts: Post[], userId: string) {
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
