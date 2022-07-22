import type {
	DbBookmark, DbPointTransaction, DbPost,
} from './db-schema';
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
function dbPostToPostFn(userId?: string) {
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
	// TODO Fix typing issues introduced with DB txn type changes for awards.
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const {
		// @ts-ignore
		userId,
		// @ts-ignore
		fromUserId,
		...cleanedTxn
	} = transaction;
	/* eslint-enable @typescript-eslint/no-unused-vars */

	// @ts-ignore
	return {
		...cleanedTxn,
		// @ts-ignore
		postId: transaction.postId?.toString(),
		_id: transaction._id?.toString(),
	};
}

export
function postToBookmarkedPostFn(bookmarks: DbBookmark[]) {
	return (p: Post): Post => ({
		...p,
		bookmarkedDate: bookmarks.find(b => b.postId.toString() === p._id)?.date || '',
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
