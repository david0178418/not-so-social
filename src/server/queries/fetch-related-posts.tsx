import type { DbPost } from '@server/db-schema';
import type {
	Feed, Post, PostIdMap,
} from '@common/types';

import {
	fetchBookmarksFromPostIds,
	fetchTopChildPosts,
} from '.';
import {
	dbPostToPostFn,
	postListsToIdList,
	postToBookmarkedPostFn,
} from '@server/transforms';

type RelatedPosts = Omit<Feed, 'cutoffISO'>

export
// TODO This all smells wrong. Doing too many urelated things. Investigate for refactor.
// Potentially starting with fetchPosts and removing the transform from that level...?
async function fetchRelatedPostsAndPrepareForClient(results: DbPost[], userId?: string): Promise<RelatedPosts> {
	const posts = results.map(dbPostToPostFn(userId));

	const postIds = posts.map(p => p._id) as string[];

	const responsePosts = await fetchTopChildPosts(postIds, userId);
	const allIds = postListsToIdList(posts, responsePosts);

	const postToBookmarkedPost = postToBookmarkedPostFn(
		userId ?
			await fetchBookmarksFromPostIds(userId, allIds) :
			[]
	);

	return {
		posts: posts.map(postToBookmarkedPost),
		responsePostMap: responsePosts
			.map(postToBookmarkedPost)
			.reduce(rollupResponsePostsToMap, {}),
	};
}

function rollupResponsePostsToMap(rollup: PostIdMap, p: Post): PostIdMap {
	if(p.parent?._id) {
		rollup[p.parent._id] = p;
	}
	return rollup;
}
