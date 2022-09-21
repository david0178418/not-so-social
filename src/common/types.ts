import type { ReactNode } from 'react';
import { UserRoles } from './constants';
import type {
	DbAttachmentPostPartial,
	DbExternalLinkPreviewData,
	DbExternalLinkPreviewType,
	DbLinkPreview,
	DbNotification,
	DbParentPostPartial,
	DbPointTransaction,
	DbPost,
	DbVideoLinkPreviewData,
} from '@server/db-schema';

type VideoLinkPreviewData = DbVideoLinkPreviewData
type LinkPreviewData = DbExternalLinkPreviewData;

export type {
	DbLinkPreview as LinkPreview,
	LinkPreviewData,
	VideoLinkPreviewData,
};

export
type AttachmentPostPartial = { _id: string } & Omit<DbAttachmentPostPartial, '_id'>;

export
interface PostLinkPreviewType {
	type: 'post',
	post: AttachmentPostPartial;
}

export
interface AttachmentSave {
	annotation: string;
	postId: string;
}

type Foo = PostLinkPreviewType | DbExternalLinkPreviewType;

export
type LinkPreviewType = Foo & {
	annotation?: string,
}

export
interface ParentPostPartial extends Omit<DbParentPostPartial, '_id' | 'ownerId'> {
	_id: string;
}

type SharedPostProps = Pick<DbPost,
'body' |
'created' |
'lastUpdated' |
'nsfl' |
'nsfw' |
'replyCount' |
'title' |
'totalPoints'
>;

export
interface Post extends SharedPostProps {
	_id?: string;
	attachedToPosts: ParentPostPartial[];
	bookmarkedDate?: string;
	linkPreviews?: LinkPreviewType[];
	isOwner: boolean;
	parent?: ParentPostPartial;
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

export
// TODO Fix this typing mess, probably with better naming convention
interface LinkPreviewSaveType {
	type: 'link' | 'post';
	annotation?: string;
	link?: LinkPreviewData;
	postId?: string;
}

export
interface PostSaveSchema {
	title: string;
	body: string;
	points: number;
	nsfw?: boolean;
	nsfl?: boolean;
	parentId?: string;
	linkPreviews?: LinkPreviewSaveType[];
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
