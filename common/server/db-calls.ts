import { DbCollections } from '@common/constants';
import { Post, PostIdMap } from '@common/types';
import { isTruthy, unique } from '@common/utils';
import { ObjectId } from 'mongodb';
import { DbBookmark, DbPost } from './db-schema';
import { getCollection } from './mongodb';
import {
	dbPostToPostFn,
	postToBookmarkedPostFn,
	postListsToIdList,
} from './transforms';

interface GetPostsReturn {
	parentPosts: PostIdMap;
	posts: Post[];
	responsePosts: PostIdMap;
}

export
async function getFeedPosts(userId: string): Promise<GetPostsReturn> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
	const results = await col
		.aggregate<DbPost>([{ $sort: { created: -1 } }])
		.toArray();
	const posts = results.map(dbPostToPostFn(userId));
	const parentIds = unique(posts.map(p => p.parentId).filter(isTruthy));
	const postIds = posts.map(p => p._id) as string[];

	const parentPosts = await getPosts(parentIds, userId);
	const responsePosts = await getTopChildPosts(postIds, userId);
	const allIds = postListsToIdList(posts, parentPosts, responsePosts);

	const postToBookmarkedPost = postToBookmarkedPostFn(
		await fetchBookmarksFromPostIds(userId, allIds)
	);

	return {
		posts: posts.map(postToBookmarkedPost),
		parentPosts: parentPosts
			.map(postToBookmarkedPost)
			.reduce(rollupPostsToMap, {}),
		responsePosts: responsePosts
			.map(postToBookmarkedPost)
			.reduce(rollupPostsToMap, {}),
	};
}

function rollupPostsToMap(rollup: PostIdMap, p: Post): PostIdMap {
	rollup[p._id || ''] = p;
	return rollup;
}

async function getPosts(postIds: string[], userId: string): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();

	return results.map(dbPostToPostFn(userId));
}

async function getTopChildPosts(postIds: string[], userId: string): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
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


async function getChildPosts(postId: string, userId: string): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ parentId: new ObjectId(postId) })
		.toArray();

	return results.map(dbPostToPostFn(userId));
}

interface getFocusedPostProps {
	post: Post | null;
	responses: Post[];
}

export
async function getFocusedPost(userId: string, id: string): Promise<getFocusedPostProps> {
	try {
		const _id = new ObjectId(id);
		const postsCol = await getCollection<DbPost>(DbCollections.Posts);

		const result = await postsCol.findOne({ _id });

		if(!result) {
			return {
				post: null,
				responses: [],
			};
		}

		const responses = await getChildPosts(id, userId);

		const post = dbPostToPostFn(userId)(result);
		const allIds = postListsToIdList([post], responses);

		const postToBookmarkedPost = postToBookmarkedPostFn(
			await fetchBookmarksFromPostIds(userId, allIds)
		);

		return {
			post: postToBookmarkedPost(post),
			responses: responses.map(postToBookmarkedPost),
		};
	} catch {
		return {
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

	const col = await getCollection<DbBookmark>(DbCollections.PostBookmarks);
	const bookmarks = await col.find({
		userId,
		postId: { $in: postIds.map(p => new ObjectId(p)) },
	}).toArray();

	return bookmarks.map(b => b.postId.toString());

}
