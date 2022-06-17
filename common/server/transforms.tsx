import type { Post } from '@common/types';
import type { DbPost } from './db-schema';

export
function dbPostToPost(userId: string) {
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
