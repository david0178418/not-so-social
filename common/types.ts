import type { ReactNode } from 'react';
import { UserRoles } from './constants';
import { DbPointTransaction } from './server/db-schema';

export
interface Post {
	_id?: string;
	body: string;
	bookmarked?: boolean;
	created: string;
	isOwner: boolean;
	lastUpdated: string;
	parentId?: string;
	points?: number;
	title: string;
	totalPoints: number;
	linkPreviews?: LinkPreviewData[];
}

type SharedPointTransactionProps = Pick<DbPointTransaction,
'appliedPoints' |
'date' |
'spentPoints' |
'type'
>;

export
interface PointTransaction extends SharedPointTransactionProps {
	_id?: string;
	postId?: string;
}

export
interface ApiResponse<T = any> {
	ok: boolean;
	data?: T;
	errors?: string[];
}

export
interface CommonButtonProps {
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
type AsyncFnReturnType<T extends (...args: any[]) => Promise<any>> = Awaited<ReturnType<T>>;

export
type Nullable<T> = T | null;

export
interface LinkPreviewData {
	url: string;
	title: string;
	siteName?: string;
	description?: string;
	mediaType?: string;
	contentType?: string;
	images: string[];
	videos: VideoLinkPreviewData[];
	favicons: string[];
}

export
interface VideoLinkPreviewData {
	url?: string;
	secureUrl?: string | null;
	type?: string | null;
	width?: string;
	height?: string;
}

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
