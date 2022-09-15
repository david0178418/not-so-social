import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import { ModalActions } from '@common/constants';
import { logout } from '@client/api-calls';
import { useAtom } from 'jotai';
import { pushToastMsgAtom } from '@common/atoms';
import { useIsLoggedOut } from '@common/hooks';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';

export
function LogoutModal() {
	const [, pustToastMsg] = useAtom(pushToastMsgAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const {
		a: action,
		...newQuery
	} = router.query;
	const actionIsLogin = action === ModalActions.Logout;
	const isOpen = actionIsLogin && !isLoggedOut;

	useEffect(() => {
		if(!actionIsLogin) {
			return;
		}

		if(isLoggedOut) {
			router.replace({
				pathname: router.pathname,
				query: newQuery,
			});
		}
	}, [actionIsLogin, isLoggedOut]);

	async function handleLogout() {
		try {
			await logout();
		} catch(e) {
			pustToastMsg('Something went wrong. Try again.');
			console.log(e);
		}
	}

	return (
		<Dialog open={isOpen}>
			<DialogTitle>
				Logout
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to log out?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Link
					replace
					passHref
					shallow
					href={{
						pathname: router.pathname,
						query: newQuery,
					}}
				>
					<Button color="error">
						Cancel
					</Button>
				</Link>
				<Button onClick={handleLogout}>
					Logout
				</Button>
			</DialogActions>
		</Dialog>
	);
}
