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

	const parentPosts = await getPosts(unique(posts.map(p => p.parentId).filter(isTruthy)), userId);

	return {
		parentPosts: parentPosts.reduce<PostIdMap>((rollup, p) => {
			rollup[p._id || ''] = p;
			return rollup;
		}, {}),
		responsePosts: {},
		posts: posts.map(p => {
			p.bookmarked = bookmarkedPosts.includes(p._id || '');
			return p;
		}),
	};
}

async function getPosts(postIds: string[], userId: string): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();

	return  results.map(dbPostToPost(userId));
}

export
async function getPost(userId: string, id: string): Promise<Post | null> {
	try {
		const _id = new ObjectId(id);
		const postsCol = await getCollection<DbPost>(DbCollections.Posts);

		const result = await postsCol.findOne({ _id });

		if(!result) {
			return null;
		}

		const post = dbPostToPost(userId)(result);

		const bookmarkCol = await getCollection<DbBookmark>(DbCollections.PostBookmarks);

		const bookmarked = !!await bookmarkCol
			.findOne({
				userId,
				postId: _id,
			});

		return {
			...post,
			bookmarked,
		};
	} catch {
		return null;
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
