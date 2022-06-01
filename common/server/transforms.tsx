import type { Post } from '@common/types';
import type { DbPost } from './db-schema';

export
function dbPostToPost(post: DbPost): Post {
	return {
		...post,
		_id: post._id?.toString(),
		ownerId: post.ownerId.toString(),
	};
}
