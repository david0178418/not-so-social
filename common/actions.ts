import type { ApiResponse } from './types';

import { signIn, signOut } from 'next-auth/react';
import { post } from '@common/client/utils';
import { urlJoin } from './utils';
import { API_URL } from './constants';

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
	return apiPost<ApiResponse>('/register', {
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
	const { data } = await apiPost<ApiResponse>('/post/save', {
		title,
		body,
	});

	return data;
}

export
async function bookmarkPost(id: string) {
	return apiPost(`post/${id}/bookmark`);
}

export
async function unbookmarkPost(id: string) {
	return apiPost(`post/${id}/remove-bookmark`);
}

function apiPost<T = any>(path: string, requestBody?: any) {
	return post<T>(urlJoin(API_URL, path), requestBody);
}

// function apiGet(path: string, params?: any) {
// 	return get(urlJoin(API_URL, path), params);
// }
