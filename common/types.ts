import type { ReactNode } from 'react';
import { UserRoles } from './constants';
import { DbPointTransaction } from './server/db-schema';

export
interface Post {
	_id?: string;
	body: string;
	bookmarkedDate?: string;
	created: string;
	isOwner: boolean;
	lastUpdated: string;
	parentId?: string;
	points?: number;
	title: string;
	totalPoints: number;
	linkPreviews?: LinkPreviewData[];
}

export
interface Settings {
	awardSignup: number;
	awardDailyPointBase: number;
	awardDailyStreakIncrement: number;
	awardDailyStreakCap: number;
}

type SharedPointTransactionProps = Pick<DbPointTransaction,
'date' |
'points' |
'type'
>;

export
interface ToastMesssage {
	message: ReactNode;
	delay?: number;
}

export
interface PointTransaction extends SharedPointTransactionProps {
	_id?: string;
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

// Utility types
export
type AsyncFnReturnType<T extends (...args: any[]) => Promise<any>> = Awaited<ReturnType<T>>;

export
type Nullable<T> = T | null;
