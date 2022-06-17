import { DbCollections } from '@common/constants';
import { Post, PostIdMap } from '@common/types';
import { isTruthy, unique } from '@common/utils';
import { ObjectId } from 'mongodb';
import { DbBookmark, DbPost } from './db-schema';
import { getCollection } from './mongodb';
import { dbPostToPost } from './transforms';

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
	const posts = results.map(dbPostToPost(userId));
	const bookmarkedPosts = await fetchBookmarksFromPostIds(userId, posts.map(p => p._id || ''));
	const parentIds = unique(posts.map(p => p.parentId).filter(isTruthy));
	const postIds = posts.map(p => p._id) as string[];

	const parentPosts = await getPosts(parentIds, userId);
	const responsePosts = await getTopChildPosts(postIds, userId);

	return {
		parentPosts: parentPosts.reduce(rollupPostsToMap, {}),
		responsePosts: responsePosts.reduce(rollupPostsToMap, {}),
		posts: posts.map(p => {
			p.bookmarked = bookmarkedPosts.includes(p._id || '');
			return p;
		}),
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

	return results.map(dbPostToPost(userId));
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

	return results.map(dbPostToPost(userId));
}


async function getChildPosts(postId: string, userId: string): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ parentId: new ObjectId(postId) })
		.toArray();

	return results.map(dbPostToPost(userId));
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

		const post = dbPostToPost(userId)(result);

		const bookmarkCol = await getCollection<DbBookmark>(DbCollections.PostBookmarks);

		const bookmarked = !!await bookmarkCol
			.findOne({
				userId,
				postId: _id,
			});

		return {
			post: {
				...post,
				bookmarked,
			},
			responses,
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
