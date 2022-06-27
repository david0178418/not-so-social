import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
