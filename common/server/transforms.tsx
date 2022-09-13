import type {
	DbBookmark,
	DbPointTransaction,
	DbPost,
	DbAttachment,
	DbAttachmentPostPartial,
} from './db-schema';
import type {
	Attachment,
	Nullable,
	PointTransaction,
	Post,
	AttachmentPostPartial,
	PostIdMap,
} from '@common/types';

import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import {
	DbAttachmentPostKeys,
	PasswordSaltLength,
} from '@common/constants';
import {
	isTruthy,
	pick,
	unique,
} from '@common/utils';

export
function dbPostToPostFn(userId?: string) {
	return (post: DbPost): Post => {
		const {
			ownerId,
			parentId,
			attachedPosts = [],
			...cleanedPost
		} = post;

		const formattedPost: Post = {
			...cleanedPost,
			attachedPosts: attachedPosts.map(dbAttachmentToAttachment),
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
function dbAttachmentToAttachment(attachment: DbAttachment): Attachment {
	return {
		...attachment,
		post: dbAttachmentPostPartialToAttachmentPostPartial(attachment.post),
	};
}

export
function dbPostToDbAttachmentPostPartial(post: DbPost): DbAttachmentPostPartial {
	const attmentPostPartial = pick(post, ...DbAttachmentPostKeys);

	return {
		_id: new ObjectId(),
		...attmentPostPartial,
	};
}

export
function dbAttachmentPostPartialToAttachmentPostPartial(attachmentPost: DbAttachmentPostPartial): AttachmentPostPartial {
	return {
		...attachmentPost,
		_id: attachmentPost._id.toString(),
	};
}

export
function dbPointTransactionToPointTransaction(transaction: DbPointTransaction): PointTransaction {
	// TODO Fix typing issues introduced with DB txn type changes for awards.
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const {
		data,
		date,
		...cleanedTxn
	} = transaction;
	/* eslint-enable @typescript-eslint/no-unused-vars */
	return {
		...cleanedTxn,
		date: date.toISOString(),
		data: {
			// @ts-ignore TODO Fix this
			postId: data.postId?.toString() || '',
		},
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
