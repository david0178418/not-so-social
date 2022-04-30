import { signIn } from 'next-auth/react';

export
async function login(username: string, password: string) {
	let success = false;

	try {
		const result: any = await signIn('credentials', {
			username,
			password,
			redirect: false,
		});

		success = !!result?.ok;
	} catch(e) {
		console.log(e);
	}

	return success;
}
