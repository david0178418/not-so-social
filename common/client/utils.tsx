import { BASE_REQ } from '@common/constants';
import { objectToArgs } from '@common/utils';
import { Key } from 'ts-key-enum';

export
async function get<T = any>(path: string, params?: any): Promise<T | null> {
	const paramString = params ? `?${objectToArgs(params)}` : '';
	try {
		const response = await fetch(`${path}${paramString}`, { ...BASE_REQ });

		if(!response.ok) {
			throw await response.json();
		}

		return await response.json() as T;
	} catch (err: any) {
		if(err.code === 'auth/id-token-expired') {
			console.log(err.code);
			// await refreshToken();

			return get<T>(path, params);
		}

		console.error(`GET request error on ${path}:`, err);
		return null;
	}
}

export
async function post<T = any>(path: string, requestBody: any = {}) {
	const response = await fetch(path, {
		method: 'POST',
		body: JSON.stringify(requestBody),
		credentials: 'include',
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json',
		},
	});

	const parsedResponse = await response.json();

	if(!parsedResponse.ok) {
		throw parsedResponse;
	}

	return parsedResponse as T;
}

export
function enterKeyHandler(key: string, handler: () => any | Promise<any>) {
	if(key === Key.Enter) {
		handler();
	}
}

export
function writeToClipboard(text: string) {
	return navigator.clipboard.writeText(text);
}
