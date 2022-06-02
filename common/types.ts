export
interface Post {
	_id?: string;
	body: string;
	bookmarked: boolean;
	created: string;
	isOwner: string;
	lastUpdated: string;
	points: number;
	title: string;
}

export
interface ApiResponse<T = any> {
	ok: boolean;
	data?: T;
	errors?: string[];
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
