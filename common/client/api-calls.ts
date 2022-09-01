import type {
	ApiResponse,
	Feed,
	LinkPreviewData,
	Notification,
	Post,
} from '@common/types';

import { signIn, signOut } from 'next-auth/react';
import { get, post } from '@common/client/client-utils';
import { urlJoin } from '@common/utils';
import { API_URL, FeedTypes } from '@common/constants';

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

interface Foo {
	previews: LinkPreviewData[];
}

export
async function getLinkPreviewsFromContent(content: string, signal?: AbortSignal) {
	return apiGet<ApiResponse<Foo>>('/link-previews-from-content', { content }, signal);
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

interface PostSaveArgs {
	title: string;
	body: string;
	points: number;
	nsfw?: boolean;
	nsfl?: boolean;
	parentId?: string;
	linkPreviews?: LinkPreviewData[];
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
	return post<T>(urlJoin(API_URL, path), requestBody);
}

function apiGet<T = any>(path: string, params?: any, signal?: AbortSignal) {
	return get<T>(urlJoin(API_URL, path), params, signal);
}
