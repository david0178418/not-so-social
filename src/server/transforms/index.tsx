import type {
	DbBookmark,
	DbPointTransaction,
	DbPost,
	DbAttachmentPostPartial,
	DbParentPostPartial,
	DbLinkPreview,
} from '../db-schema';
import type {
	Nullable,
	ParentPostPartial,
	PointTransaction,
	Post,
} from '@common/types';

import { hash } from 'bcryptjs';
import { ArrayElement, ObjectId } from 'mongodb';
import {
	DbAttachmentPostKeys,
	DbParentPostPartialKeys,
	ParentPostPartialKeys,
	PasswordSaltLength,
} from '@common/constants';
import {
	isTruthy,
	pick,
	unique,
} from '@common/utils';
import { postToAttachmentPostPartial } from './client';

export { postToAttachmentPostPartial };

export
function dbPostToPostFn(userId?: string) {
	return (post: DbPost): Post => {
		const {
			ownerId,
			parent,
			linkPreviews = [], // Should this be a required filed on Post?
			attachedToPosts = [],
			...cleanedPost
		} = post;

		const formattedPost: Post = {
			...cleanedPost,
			attachedToPosts: attachedToPosts.map(dbParentPostPartialToParentPostPartial),
			isOwner: userId === ownerId.toString(),
			_id: post._id?.toString(),
			linkPreviews: linkPreviews?.map(dbLinkPreviewToLinkPreview),
		};

		if(parent) {
			formattedPost.parent = dbParentPostPartialToParentPostPartial(parent);
		}

		return formattedPost;
	};
}

function dbLinkPreviewToLinkPreview(linkPreview: DbLinkPreview): ArrayElement<Post['linkPreviews']> {
	if(linkPreview.type === 'link') {
		return linkPreview;
	}

	return {
		...linkPreview,
		post: {
			...linkPreview.post,
			_id: linkPreview.post._id.toString(),
		},
	};
}

export
function dbParentPostPartialToParentPostPartial(post: DbParentPostPartial): ParentPostPartial {
	return {
		...pick(post, ...ParentPostPartialKeys),
		_id: post._id?.toString() || '',
	};
}

export
function dbPostToDbParentPostPartial(post: DbPost) {
	return pick(post, ...DbParentPostPartialKeys);
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
function postToDbAttachmentPostPartial(post: Post): DbAttachmentPostPartial {
	return {
		...postToAttachmentPostPartial(post),
		_id: new ObjectId(post._id),
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
function passwordToHash(password: string) {
	return hash(password, PasswordSaltLength);
}
