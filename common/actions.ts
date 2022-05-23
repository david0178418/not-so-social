import { signIn, signOut } from 'next-auth/react';

export
async function login(username: string, password: string) {
	let success = false;

	const result: any = await signIn('credentials', {
		username,
		password,
		redirect: false,
	});

	success = !!result?.ok;

	return success;
}

export
async function register(username: string, password: string) {
	console.log(username, password);
	return false;
}

export
async function logout() {
	await signOut();
}
