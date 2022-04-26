import twttr from 'twitter-text';
import { format, formatDistanceToNow } from 'date-fns';
import { IS_SSR } from './constants';

export
function formatDate(dateStr: string) {
	return format(new Date(dateStr), 'p · PP');
}

const numFormatter = Intl.NumberFormat('en', { notation: 'compact' });

export
function formatCompactNumber(num: number) {
	return numFormatter.format(num);
}

export
function clamp(num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max);
}


export
function getTimeSinceDate(dateStr: string) {
	return formatDistanceToNow(new Date(dateStr));
}

export
function parseContentString(str: string) {
	return twttr.autoLink(str, {
		hashtagUrlBase: '/q=',
		cashtagUrlBase: '/q=',
		usernameUrlBase: '/u/',
		listUrlBase: '/',
		targetBlank: true,
	}).trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
}

export
function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export
function decodeBase64(str: string) {
	const body = Buffer.from(str, 'base64').toString('utf8');
	return JSON.parse(body);
}

export
function encodeBase64(obj: any) {
	const str = JSON.stringify(obj);
	return Buffer.from(str).toString('base64');
}

export
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export
function pick<T, K extends keyof T>(object: T, ...keys: K[]): Pick<T, K> {
	return Object.assign(
		{},
		...keys.map(key => {
			if (object && Object.prototype.hasOwnProperty.call(object, key)) {
				return { [key]: object[key] };
			}
		})
	);
}

export
function exec(fn: () => any | Promise<any>) {
	return fn();
}

export
function defer(fn: () => any | Promise<any>) {
	setTimeout(fn, 1);
}

export
function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		// eslint-disable-next-line eqeqeq, no-mixed-operators
		const r = Math.random() * 16|0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export
// Source: https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/URLJoin.md
function urlJoin (...args: Array<string | undefined>) {
	return args
		.join('/')
		.replace(/[/]+/g, '/')
		.replace(/^(.+):\//, '$1://')
		.replace(/^file:/, 'file:/')
		.replace(/\/(\?|&|#[^!])/g, '$1')
		.replace(/\?/g, '&')
		.replace('&', '?');
}

export
function objectToArgs(rawArgs: any) {
	if(typeof rawArgs === 'string' || typeof rawArgs === 'number') {
		return rawArgs;
	}

	const args = {
		...rawArgs,
		src: 'client-outreach',
	};

	return Object
		.keys(args)
		.map(arg => `${arg}=${encodeURIComponent(args[arg])}`)
		.join('&');
}

export
function last<T>(arr: T[]) {
	return arr[arr.length - 1];
}

export
function localizedDateFormat(date: string) {
	return IS_SSR ?
		'-' :
		format(new Date(date), 'p · PP');
}

export
function nowISOString() {
	return (new Date()).toISOString();
}

export
function multiplyList<T>(list: T[], multiple: number) {
	return range(multiple).map(() => list).flat();
}

export
function range(size: number, startValue = 0) {
	// @ts-ignore
	return [ ...Array(size).keys() ].map(i => i + startValue);
}
