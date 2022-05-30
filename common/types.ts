export
interface DbCreds {
	username: string;
	userId: string;
	pwHash: string;
}

export
interface ApiResponse {
	ok: boolean;
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
