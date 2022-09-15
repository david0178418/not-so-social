import type { ReactNode } from 'react';
import type {
	DbAttachment,
	DbAttachmentPostPartial,
	DbLinkPreviewData,
	DbNotification,
	DbPointTransaction,
	DbPost,
	DbVideoLinkPreviewData,
} from '@server/db-schema';
import { UserRoles } from './constants';

export {
	DbLinkPreviewData as LinkPreviewData,
	DbVideoLinkPreviewData as VideoLinkPreviewData,
};

export
interface AttachmentPostPartial extends Omit<DbAttachmentPostPartial, '_id'> {
	_id: string;
}

export
interface Attachment extends Omit<DbAttachment, 'post'> {
	post: AttachmentPostPartial;
}

type SharedPostProps = Pick<DbPost,
'body' |
'created' |
'lastUpdated' |
'linkPreviews' |
'nsfl' |
'nsfw' |
'replyCount' |
'title' |
'totalPoints'
>;

export
interface Post extends SharedPostProps {
	_id?: string;
	attachedPosts: Attachment[];
	attachedToPosts: Attachment[];
	bookmarkedDate?: string;
	isOwner: boolean;
	parentId?: string;
	points?: number;
}

export
interface Settings {
	awardSignup: number;
	awardDailyPointBase: number;
	awardDailyStreakIncrement: number;
	awardDailyStreakCap: number;
}

type SharedPointTransactionProps = Pick<DbPointTransaction,
'points' |
'type'
>;

export
interface ToastMesssage {
	message: ReactNode;
	delay?: number;
	onClose?(): void;
}

export
interface PointTransaction extends SharedPointTransactionProps {
	_id?: string;
	date: string;
	// TODO address this
	data: {
		postId?: string;
	};
}

export
interface ApiResponse<T = any> {
	ok: boolean;
	data?: T;
	errors?: string[];
}

export
interface CommonButtonProps {
	disabled?: boolean;
	fullWidth?: boolean;
	label?: string;
	href?: string;
	onClick?(): void;
	children?: ReactNode;
}

export
interface PostIdMap {
	[postId: string]: Post;
}

export
// TODO break this up?
interface Feed {
	posts: Post[];
	parentPostMap: PostIdMap;
	responsePostMap: PostIdMap;
	cutoffISO?: string;
}

export
type Notification = Pick<DbNotification, 'message' | 'date'> & {
	_id: string;
};

interface User {
	id: string;
	username: string;
	role: UserRoles;
}

declare module 'next-auth' {
	interface Session {
		user: User;
	}

}

declare module 'next-auth/jwt' {
	interface JWT {
		user: User;
	}
}

declare module 'joi' {
	// https://github.com/sideway/joi/pull/2727
	interface ObjectSchema<TSchema = any> {
		validate(value: any, options?: ValidationOptions): ValidationResult<TSchema>;
		validateAsync(value: any, options?: AsyncValidationOptions): Promise<TSchema>;
	}
}

// Utility types
export
type AsyncFnReturnType<T extends (...args: any[]) => Promise<any>> = Awaited<ReturnType<T>>;

export
type Nullable<T> = T | null;

type Invalid<T> = ['Needs to be all of', T];

export
// Source https://stackoverflow.com/a/73457231
function arrayOfAll<T extends keyof any>() {
	return (
		<U extends T[]>(
			...array: U & ([T] extends [U[number]] ? unknown : Invalid<T>[])
		) => array
	);
}
