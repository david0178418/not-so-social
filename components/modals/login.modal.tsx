import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Key } from 'ts-key-enum';
import { ModalActions } from '@common/constants';
import { login } from '@common/actions';
import { useAtom } from 'jotai';
import { pushToastMsgAtom } from '@common/atoms';
import { useIsLoggedIn } from '@common/hooks';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	useMediaQuery,
	useTheme,
} from '@mui/material';

export
function LoginModal() {
	const [, pustToastMsg] = useAtom(pushToastMsgAtom);
	const isLoggedIn = useIsLoggedIn();
	const router = useRouter();
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const valid = !!(password && username);
	const {
		a: action,
		...newQuery
	} = router.query;
	const actionIsLogin = action === ModalActions.Login;
	const isOpen = actionIsLogin && !isLoggedIn;

	useEffect(() => {
		if(!actionIsLogin) {
			return;
		}

		if(isLoggedIn) {
			router.replace({
				pathname: router.pathname,
				query: newQuery,
			}, undefined, { shallow: true });
		}

	}, [actionIsLogin, isLoggedIn]);

	function handleKeyUp(key: string) {
		if(key === Key.Enter) {
			handleLogin();
		}
	}

	async function handleLogin() {
		if(!valid) {
			return;
		}

		try {

			if(await login(username, password)) {
				setUsername('');
			} else {
				pustToastMsg('Incorrect Login');
			}

		} catch(e) {
			pustToastMsg('Something went wrong. Try again.');
			console.log(e);
		}

		setPassword('');
	}

	return (
		<Dialog
			fullScreen={fullScreen}
			open={isOpen}
		>
			<DialogTitle>
				Login
			</DialogTitle>
			<DialogContent>
				<Box
					noValidate
					autoComplete="off"
					component="form"
				>
					<TextField
						autoFocus
						fullWidth
						label="Username"
						variant="standard"
						placeholder="username"
						type="text"
						value={username}
						onKeyUp={e => handleKeyUp(e.key)}
						onChange={e => setUsername(e.target.value)}
					/>
					<TextField
						fullWidth
						label="Password"
						variant="standard"
						type="password"
						value={password}
						onKeyUp={e => handleKeyUp(e.key)}
						onChange={e => setPassword(e.target.value)}
					/>
				</Box>
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
						Close
					</Button>
				</Link>
				<Button disabled={!valid} onClick={handleLogin}>
					Login
				</Button>
			</DialogActions>
		</Dialog>
	);
}
