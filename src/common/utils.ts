import { format, formatDistanceToNow } from 'date-fns';
import { IsSsr } from './constants';

export
function formatDate(dateStr: string | Date) {
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
function inRange(num: number, min: number, max: number) {
	return (min < num && num < max);
}

export
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export
function pick<T, K extends keyof T>(object: T, ...ks: K[]): Pick<T, K> {
	return Object.assign(
		{},
		...ks.map(key => {
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
function isTruthy<T>(val: T | null | undefined): val is T {
	return !!val;
}

export
function unique<T>(arr: T[]) {
	return Array.from(new Set(arr));
}

export
function uniqueBy<T>(arr: T[], key: keyof T) {
	return [
		...new Map(
			arr.map(
				item => [item[key], item]
			)
		).values(),
	];
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
function objectToArgs(args: any) {
	if(typeof args === 'string' || typeof args === 'number') {
		return args;
	}

	return Object
		.keys(args)
		.map(arg => `${arg}=${encodeURIComponent(args[arg])}`)
		.join('&');
}

export
function keys<T extends Record<any, unknown>>(obj: T): Array<keyof T> {
	return Object.keys(obj);
}

export
function last<T>(arr: T[]): T | null {
	return arr[arr.length - 1] || null;
}

export
function localizedDateFormat(date: string) {
	return IsSsr ?
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
	return [ ...Array(size).keys() ].map(i => i + startValue);
}

export
function removeItem<T>(arr: T[], removeIndex: number) {
	return arr.filter((_, index) => index !== removeIndex);
}

export
function truncate(input: string, maxLen = 50) {
	return input.length > maxLen ?
		`${input.substring(0, maxLen)}…` :
		input;
}

export
const NoOp = () => {};

export
function tuple<T extends any[]>(...args: T) {
	return args;
}
