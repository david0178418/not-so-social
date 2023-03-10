import type {
	ApiResponse,
	Feed,
	LinkPreviewType,
	Notification,
	Post,
	PostSave,
} from '@common/types';

import { signIn, signOut } from 'next-auth/react';
import { get, post } from '@client/client-utils';
import { urlJoin } from '@common/utils';
import { ApiUrl, FeedTypes } from '@common/constants';

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

interface LinkPreviewsFromContentReturn {
	previews: LinkPreviewType[];
}

export
async function getLinkPreviewsFromContent(content: string, signal?: AbortSignal) {
	return apiGet<ApiResponse<LinkPreviewsFromContentReturn>>('/link-previews-from-content', { content }, signal);
}

interface FetchFeedParams {
	afterTimeISO?: string;
	fromIndex?: number;
	searchTerm?: string;
}

export
async function getFeed(type: FeedTypes, params?: FetchFeedParams) {
	return apiGet<ApiResponse<{feed: Feed}>>(`/feed/${type}`, params);
}

export
async function postSave(args: PostSave) {
	const { data } = await apiPost<ApiResponse>('/post/save', args);

	return data;
}

export async function postBoost(postId: string, points: number) {
	await apiPost(`/post/${postId}/boost`, { points });
}

export
async function bookmarkPost(id: string) {
	return apiPost<ApiResponse<{date: string}>>(`post/${id}/bookmark`);
}

export
async function unbookmarkPost(id: string) {
	return apiPost<ApiResponse>(`post/${id}/remove-bookmark`);
}

export
async function getBalance() {
	const { data } = await apiGet('/user/balance');

	return data?.balance || 0;
}

export
async function getNotificaitons(): Promise<Notification[]> {
	const result = await apiGet<ApiResponse<{notifications: Notification[]}>>('/user/notifications');

	return result?.data?.notifications || [];
}

export
async function getPost(id: string): Promise<Post | null> {
	const result = await apiGet<ApiResponse<{ post: Post}>>(`/post/${id}`);

	return result?.data?.post || null;
}

export
async function dismissNotification(id: string): Promise<void> {
	await apiGet('/user/notifications/dismiss', { id });
}

function apiPost<T = any>(path: string, requestBody?: any) {
	return post<T>(urlJoin(ApiUrl, path), requestBody);
}

function apiGet<T = any>(path: string, params?: any, signal?: AbortSignal) {
	return get<T>(urlJoin(ApiUrl, path), params, signal);
}
