import create from 'zustand';
import { DefaultState } from '@common/constants';
import { State } from '@common/types';
import { useLayoutEffect } from 'react';
import createContext from 'zustand/context';

function initializeStore(initialState: Partial<State>) {
	return create(() => ({
		...DefaultState,
		...initialState,
	}));
}

export
let store: ReturnType<typeof initializeStore>;

export
const {
	Provider,
	useStore,
} = createContext<State>();

export
function useCreateStore(initialState: Partial<State> = {}) {
	if (typeof window === 'undefined') {
		// For SSR & SSG, always use a new store.
		return () => initializeStore(initialState);
	}

	// For CSR, always re-use same store.
	store = store ?? initializeStore(initialState);
	// And if initialState changes, then merge states in the next render cycle.
	//
	// eslint complaining "React Hooks must be called in the exact same order in every component render"
	// is ignorable as this code runs in same order in a given environment
	// eslint-disable-next-line react-hooks/rules-of-hooks
	useLayoutEffect(() => {
		// @ts-ignore
		if (initialState && store) {
			store.setState({
				...store.getState(),
				...initialState,
			});
		}
	}, [initialState]);

	return () => store;
}

if(typeof window !== 'undefined') {
	// @ts-ignore
	window.getStore = () => store;
}
