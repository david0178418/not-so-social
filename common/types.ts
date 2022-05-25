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
