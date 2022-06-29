import type { ApiResponse } from './types';

import { signIn, signOut } from 'next-auth/react';
import { get, post } from '@common/client/utils';
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
	return apiPost<ApiResponse>('/user/register', {
		username,
		password,
	});
}

export
function updatePassword(password: string) {
	return apiPost<ApiResponse>('/user/update-password', { password });
}

export
async function logout() {
	await signOut();
}

interface PostSaveArgs {
	title: string;
	body: string;
	points: number;
	parentId?: string;
}

export
async function postSave(args: PostSaveArgs) {
	const { data } = await apiPost<ApiResponse>('/post/save', args);

	return data;
}

export async function postBoost(postId: string, points: number) {
	await apiPost(`/post/${postId}/boost`, { points });
}

export
async function bookmarkPost(id: string) {
	return apiPost(`post/${id}/bookmark`);
}

export
async function unbookmarkPost(id: string) {
	return apiPost(`post/${id}/remove-bookmark`);
}

export
async function getBalance() {
	const { data } = await apiGet('/balance');

	return data?.balance || 0;
}

function apiPost<T = any>(path: string, requestBody?: any) {
	return post<T>(urlJoin(API_URL, path), requestBody);
}

function apiGet(path: string, params?: any) {
	return get(urlJoin(API_URL, path), params);
}
