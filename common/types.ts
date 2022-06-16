import type { ReactNode } from 'react';

export
interface Post {
	_id?: string;
	body: string;
	bookmarked?: boolean;
	created: string;
	isOwner: boolean;
	lastUpdated: string;
	parentId?: string;
	points: number;
	title: string;
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


declare module 'next-auth' {
	interface User {
		id: string;
		username: string;
	}

	interface Session {
		user: User;
	}
}
