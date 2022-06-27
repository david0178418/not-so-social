import { atom } from 'jotai';
import { Post } from './types';

export
const loadingAtom = atom(false);

const toastQueueAtom = atom<string[]>([]);

export
const toastMsgAtom = atom(get => get(toastQueueAtom)[0] || '');

export
const boostPostAtom = atom<Post | null>(null);

export
const pushToastMsgAtom = atom(
	null,
	(get, set, msg: string) => {
		const tqa = get(toastQueueAtom);

		set(toastQueueAtom, [ ...tqa, msg ]);
	},
);

export
const clearCurrentToastMsgAtom = atom(
	null,
	(get, set) => {
		const tqa = get(toastQueueAtom);
		tqa.shift();

		set(toastQueueAtom, [ ...tqa ]);
	},
);
