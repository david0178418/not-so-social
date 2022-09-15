import type { UrlObject } from 'url';

import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { login, register } from '@client/api-calls';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import Link from 'next/link';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';

interface Props {
	urlObj: UrlObject;
}

export
function RegistrationForm(props: Props) {
	const { urlObj } = props;
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [repassword, setRepassword] = useState('');
	const valid = !!(
		username &&
		password && (
			password === repassword
		)
	);

	function handleKeyUp(key: string) {
		if(key === Key.Enter) {
			handleRegister();
		}
	}

	async function handleRegister() {
		if(!valid) {
			return;
		}

		setLoading(true);

		try {
			if(
				await register(username, password) &&
				await login(username, password)
			) {
				setUsername('');

				setTimeout(() => pustToastMsg({
					message: `
						Find your balance under your username on the left rail.
						You've earned points for signing up!
						Use them to boost posts you like or to create content of your own!
					`,
					delay: 15000,
				}));
			}
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pustToastMsg);
			console.log(e);
		}

		setPassword('');
		setRepassword('');
		setLoading(false);
	}

	return (
		<>
			<DialogTitle>
				Create Account
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
					<TextField
						fullWidth
						label="Re-enter Password"
						variant="standard"
						type="password"
						value={repassword}
						onKeyUp={e => handleKeyUp(e.key)}
						onChange={e => setRepassword(e.target.value)}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Link
					replace
					passHref
					shallow
					href={urlObj}
				>
					<Button color="error">
						Cancel
					</Button>
				</Link>
				<Button
					variant="outlined"
					disabled={!valid}
					onClick={handleRegister}
				>
					Register
				</Button>
			</DialogActions>
		</>
	);
}
