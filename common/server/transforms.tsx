import type { Post } from '@common/types';
import { isTruthy, unique } from '@common/utils';
import type { DbPost } from './db-schema';

export
function dbPostToPostFn(userId: string) {
	return (post: DbPost): Post => {
		const {
			ownerId,
			parentId,
			...cleanedPost
		} = post;

		const formattedPost: Post = {
			...cleanedPost,
			points: 0,
			isOwner: userId === ownerId.toString(),
			_id: post._id?.toString(),
			ownerId: ownerId.toString(),
		};

		if(parentId) {
			formattedPost.parentId = parentId.toString();
		}

		return formattedPost;
	};
}

export
function postToBookmarkedPostFn(bookmarkedIds: string[]) {
	return (p: Post) => ({
		...p,
		bookmarked: bookmarkedIds.includes(p._id || ''),
	});
}

export
function postListsToIdList(...postLists: Post[][]) {
	return unique(
		postLists
			.flat()
			.map(p => p._id)
			.filter(isTruthy),
	);
}
