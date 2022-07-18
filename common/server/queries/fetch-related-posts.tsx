import type { DbPost } from '@common/server/db-schema';

import { isTruthy, unique } from '@common/utils';
import {
	dbPostToPostFn,
	postListsToIdList,
	postToBookmarkedPostFn,
	rollupPostsToMapFn,
} from '@common/server/transforms';
import {
	fetchBookmarksFromPostIds,
	fetchPosts,
	fetchTopChildPosts,
} from '.';

export
async function fetchRelatedPosts(results: DbPost[], userId?: string) {
	const posts = results.map(dbPostToPostFn(userId));

	const parentIds = unique(posts.map(p => p.parentId).filter(isTruthy));
	const postIds = posts.map(p => p._id) as string[];

	const parentPosts = await fetchPosts(parentIds, userId);
	const responsePosts = await fetchTopChildPosts(postIds, userId);
	const allIds = postListsToIdList(posts, parentPosts, responsePosts);

	const postToBookmarkedPost = postToBookmarkedPostFn(
		userId ?
			await fetchBookmarksFromPostIds(userId, allIds) :
			[]
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
