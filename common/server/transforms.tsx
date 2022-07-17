import type { DbPointTransaction, DbPost } from './db-schema';
import { hash } from 'bcryptjs';
import { isTruthy, unique } from '@common/utils';
import type {
	Nullable,
	PointTransaction,
	Post,
	PostIdMap,
} from '@common/types';
import { PasswordSaltLength } from '@common/constants';

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
			isOwner: userId === ownerId.toString(),
			_id: post._id?.toString(),
		};

		if(parentId) {
			formattedPost.parentId = parentId.toString();
		}

		return formattedPost;
	};
}

export
function dbPointTransactionToPointTransaction(transaction: DbPointTransaction): PointTransaction {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const {
		userId,
		fromUserId,
		...cleanedTxn
	} = transaction;
	/* eslint-enable @typescript-eslint/no-unused-vars */

	return {
		...cleanedTxn,
		postId: transaction.postId?.toString(),
		_id: transaction._id?.toString(),
	};
}

export
function postToBookmarkedPostFn(bookmarkedIds: string[]) {
	return (p: Post): Post => ({
		...p,
		bookmarked: bookmarkedIds.includes(p._id || ''),
	});
}


export
function postListsToIdList(...postLists: Nullable<Post>[][]): string[] {
	return unique(
		postLists
			.flat()
			.filter(isTruthy)
			.map(p => p._id as string),
	);
}

export
function rollupPostsToMapFn(prop: keyof Pick<Post, '_id' | 'parentId'> = '_id') {
	return (rollup: PostIdMap, p: Post): PostIdMap => {
		if(p[prop]) {
			rollup[p[prop] || ''] = p;
		}
		return rollup;
	};
}

export
function passwordToHash(password: string) {
	return hash(password, PasswordSaltLength);
}
