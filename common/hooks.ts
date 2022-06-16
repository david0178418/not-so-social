import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

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
