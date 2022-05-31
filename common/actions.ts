import type { ApiResponse } from './types';

import { signIn, signOut } from 'next-auth/react';
import { post } from '@common/client/utils';

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
function register(username: string, password: string) {
	return post<ApiResponse>('/api/register', {
		username,
		password,
	});
}

export
async function logout() {
	await signOut();
}

export
async function postSave(title: string, body: string) {
	const { data } = await post<ApiResponse>('/api/post/save', {
		title,
		body,
	});

	return data;
}
