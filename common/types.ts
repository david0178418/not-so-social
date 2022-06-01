export
interface Post {
	_id?: string;
	body: string;
	title: string;
	created: string;
	lastUpdated: string;
	ownerId: string;
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
