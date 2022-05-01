import { useSession } from 'next-auth/react';

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
