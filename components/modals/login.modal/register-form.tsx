import type { UrlObject } from 'url';

import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { login, register } from '@common/actions';
import { useAtom } from 'jotai';
import { pushToastMsgAtom } from '@common/atoms';
import Link from 'next/link';
import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
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
	const [, pustToastMsg] = useAtom(pushToastMsgAtom);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [repassword, setRepassword] = useState('');
	const [loading, setLoading] = useState(false);
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
			<Backdrop
				open={loading}
				sx={{
					color: '#fff',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</>
	);
}