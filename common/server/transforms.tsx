import type { Post } from '@common/types';
import type { DbPost } from './db-schema';

export
function dbPostToPost(userId: string) {
	return (post: DbPost): Post => {
		const {
			ownerId,
			...cleanedPost
		} = post;

		return {
			...cleanedPost,
			points: 0,
			isOwner: userId === ownerId.toString(),
			_id: post._id?.toString(),
			//@ts-ignore
			userId,
			//@ts-ignore
			ownerId: ownerId.toString(),
		};
	};
}
