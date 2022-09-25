import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ModalActions } from '@common/constants';
import { useIsLoggedIn } from '@common/hooks';
import { LoginForm } from './login-form';
import { RegistrationForm } from './register-form';
import {
	Button,
	Dialog,
	DialogActions,
	useMediaQuery,
	useTheme,
} from '@mui/material';

export
function LoginModal() {
	const isLoggedIn = useIsLoggedIn();
	const router = useRouter();
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const [isRegister, setIsRegister] = useState(false);
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
			});
		}
	}, [actionIsLoginRegister, isLoggedIn]);

	if(!isOpen) {
		// TODO Figure out weird issue with background overlay persisting in
		// some instances. May be related to the "shallow" prop on NextJS Link
		return null;
	}

	return (
		<>
			<Dialog
				open
				fullScreen={fullScreen}
			>
				{isRegister && (
					<RegistrationForm urlObj={urlObj} />
				)}
				{!isRegister && (
					<LoginForm urlObj={urlObj} />
				)}
				<DialogActions style={{ justifyContent: 'center' }}>
					{isRegister && (
						<Button size="small" onClick={() => setIsRegister(false)}>
							Login with Existing Account
						</Button>
					)}
					{!isRegister && (
						<Button size="small" onClick={() => setIsRegister(true)}>
							Create an Account
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
}
