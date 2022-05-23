import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ModalActions } from '@common/constants';
import { useIsLoggedIn } from '@common/hooks';
import { LoginForm } from './login-form';
import {
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	useMediaQuery,
	useTheme,
} from '@mui/material';

export
function LoginModal() {
	const isLoggedIn = useIsLoggedIn();
	const router = useRouter();
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const {
		a: action,
		...newQuery
	} = router.query;
	const urlObj = {
		pathname: router.pathname,
		query: newQuery,
	};
	const actionIsLoginRegister = action === ModalActions.LoginRegister;
	const isOpen = actionIsLoginRegister && !isLoggedIn;

	useEffect(() => {
		if(!actionIsLoginRegister) {
			return;
		}

		if(isLoggedIn) {
			router.replace({
				pathname: router.pathname,
				query: newQuery,
			}, undefined, { shallow: true });
		}

	}, [actionIsLoginRegister, isLoggedIn]);

	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
			>
				<DialogTitle>
					Login
				</DialogTitle>
				<LoginForm urlObj={urlObj} />
				<DialogActions className="login-register-toggle">
					<Button size="small">
						Create an Account
					</Button>
				</DialogActions>
			</Dialog>
			<style jsx>{`
				.login-register-toggle {
					justify-content: center;
				}
			`}</style>
		</>
	);
}
