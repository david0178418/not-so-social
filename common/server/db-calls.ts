import { DbCollections, UserActivityTypes } from '@common/constants';
import { Post, PostIdMap } from '@common/types';
import {
	isTruthy, nowISOString, unique,
} from '@common/utils';
import { ObjectId } from 'mongodb';
import { DbPost, DbUserActivity } from './db-schema';
import { getCollection } from './mongodb';
import {
	dbPostToPostFn,
	postToBookmarkedPostFn,
	postListsToIdList,
	rollupPostsToMapFn,
} from './transforms';

interface GetPostsReturn {
	parentPostMap: PostIdMap;
	posts: Post[];
	responsePostMap: PostIdMap;
}

export
async function fetchFeedPosts(userId: string): Promise<GetPostsReturn> {
	const col = await getCollection(DbCollections.Posts);
	const results = await col
		.aggregate<DbPost>([{ $sort: { created: -1 } }])
		.toArray();
	const posts = results.map(dbPostToPostFn(userId));

	return Fooo(posts, userId);
}

// TODO Is there a better way to do this in MongoDB
const DOC_PLACEHOLDER = 'docTemp';

export
async function fetchUserBookmarkedPosts(userId: string): Promise<GetPostsReturn> {
	const col = await getCollection(DbCollections.PostBookmarks);

	const results = await col
		.aggregate<DbPost>([
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
	])
		.toArray();

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

async function fetchPost(postId: string, userId: string): Promise<Post | null> {
	const posts = await fetchPosts([postId], userId);
	return posts?.[0] || null;
}

async function fetchPosts(postIds: string[], userId: string): Promise<Post[]> {
	const col = await getCollection(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();

	return results.map(dbPostToPostFn(userId));
}

async function fetchTopChildPosts(postIds: string[], userId: string): Promise<Post[]> {
	const col = await getCollection(DbCollections.Posts);
	const postObjectIds = postIds.map(i => new ObjectId(i));
	const results = await col.aggregate<DbPost>([
		{ $match: { parentId: { $in: postObjectIds } } },
		{ $sort: { points: 1 } },
		{
			$group: {
				_id: '$parentId',
				post: { '$first': '$$ROOT' },
			},
		},
		{ $replaceRoot: { newRoot: '$post' } },
	]).toArray();

	return results.map(dbPostToPostFn(userId));
}


async function fetchChildPosts(postId: string, userId: string): Promise<Post[]> {
	const col = await getCollection(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ parentId: new ObjectId(postId) })
		.toArray();

	return results.map(dbPostToPostFn(userId));
}

interface getFocusedPostProps {
	parentPost: Post | null;
	post: Post | null;
	responses: Post[];
}

export
async function fetchFocusedPost(userId: string, id: string): Promise<getFocusedPostProps> {
	try {
		const post = await fetchPost(id, userId);

		if(!post) {
			return {
				parentPost: null,
				post: null,
				responses: [],
			};
		}

		const parentPost = post.parentId ?
			await fetchPost(post.parentId, userId) :
			null;
		const responses = await fetchChildPosts(id, userId);

		const allIds = postListsToIdList([post, parentPost], responses);

		const postToBookmarkedPost = postToBookmarkedPostFn(
			await fetchBookmarksFromPostIds(userId, allIds)
		);

		return {
			parentPost: parentPost && postToBookmarkedPost(parentPost),
			post: postToBookmarkedPost(post),
			responses: responses.map(postToBookmarkedPost),
		};
	} catch {
		return {
			parentPost: null,
			post: null,
			responses: [],
		};
	}
}

export
async function fetchBookmarksFromPostIds(userId: string, postIds: string[]) {
	if(!postIds.length) {
		return [];
	}

	const col = await getCollection(DbCollections.PostBookmarks);
	const bookmarks = await col.find({
		userId,
		postId: { $in: postIds.map(p => new ObjectId(p)) },
	}).toArray();

	return bookmarks.map(b => b.postId.toString());
}

export
async function fetchUser(username: string) {
	const credsCol = await getCollection(DbCollections.Creds);
	const result = await credsCol.aggregate([
		{ $match: { $expr: { $eq: [ { $toLower: '$username' }, username.toLowerCase() ] } } },
		{ $limit: 1 },
	]).toArray();

	return result[0] || null;
}

export
async function recordActivity(userId: string, type: UserActivityTypes, params?: any) {
	const col = await getCollection(DbCollections.UserActivity);
	const record: DbUserActivity = {
		date: nowISOString(),
		userId: new ObjectId(userId),
		type,
	};

	if(params) {
		record.params = params;
	}

	await col.replaceOne({
		userId: record.userId,
		type,
	}, record, { upsert: true });
}
