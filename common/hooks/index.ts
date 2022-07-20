import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Feed } from '@common/types';
import { tuple } from '@common/utils';
import { getFeed } from '@common/client/api-calls';
import {
	PageSize,
	UserRoles,
} from '@common/constants';

export
function useIsLoggedIn() {
	const { status } = useSession();

	return status === 'authenticated';
}

export
function useIsLoggedOut() {
	const { status } = useSession();
	return status === 'unauthenticated';
}

export
function useIsAdmin() {
	const { data } = useSession();

	return data?.user.role === UserRoles.Admin;
}

export
function useRefreshPage() {
	const {
		replace,
		asPath,
	} = useRouter();

	return () => replace(asPath);
}

export
function useRouteBackDefault(fallback = '/') {
	const router = useRouter();

	return () => {
		if(document.referrer.startsWith(location.origin)) {
			router.back();
		} else {
			router.replace(fallback);
		}
	};
}

export
function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export
function useFeed(initialFeed: Feed) {
	const [feed, setFeed] = useState(initialFeed);
	const [isDone, setIsDone] = useState(initialFeed.posts.length < PageSize);

	useEffect(() => {
		if(feed === initialFeed) {
			return;
		}

		setFeed(initialFeed);
		setIsDone(initialFeed.posts.length < PageSize);
	}, [initialFeed]);

	async function onMore(...params: Parameters<typeof getFeed>) {
		const [type, args] = params;
		const response = await getFeed(type, args);
		const newFeedItems = response?.data?.feed || null;

		if(!newFeedItems) {
			setIsDone(true);

			return;
		}

		setFeed({
			posts: [
				...feed.posts,
				...newFeedItems.posts,
			],
			parentPostMap: {
				...feed.parentPostMap,
				...newFeedItems.parentPostMap,
			},
			responsePostMap: {
				...feed.responsePostMap,
				...newFeedItems.responsePostMap,
			},
		});

		if(!newFeedItems?.posts || newFeedItems.posts.length < PageSize) {
			return setIsDone(true);
		}
	}

	return tuple(feed, isDone, onMore);
}
