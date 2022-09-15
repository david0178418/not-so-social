import { updatePassword } from '@client/api-calls';
import { PasswordMaxLength, PasswordMinLength } from '@common/constants';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import {
	Button,
	Grid,
	TextField,
	Typography,
} from '@mui/material';

export
function PasswordChangeForm() {
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const [touched, setTouched] = useState(false);
	const [pw, setPw] = useState('');
	const [pw2, setPw2] = useState('');
	const pwMatch = pw === pw2;
	const pwLongEnough = pw.length >= PasswordMinLength;
	const pwShortEnough = pw.length <= PasswordMaxLength;
	const canSave = pwMatch && pwLongEnough && pwShortEnough;
	let error = '';

	if(touched) {
		if(!pwShortEnough) {
			error = `Password must have no more than ${PasswordMaxLength} characters`;
		} else if(!pwLongEnough) {
			error = `Password must be at least ${PasswordMinLength} characters`;
		} else if(!pwMatch) {
			error = 'Passwords must match';
		}
	}

	async function handleUpdate() {
		try {
			setLoading(true);
			await updatePassword(pw);
			pustToastMsg('Password updated!');
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pustToastMsg);
			console.log(e);
		}

		setLoading(false);
	}

	return (
		<>
			<Typography variant="h6">
				Update Password
			</Typography>
			<Grid
				container
				rowSpacing={1}
				columnSpacing={1}
				columns={{ xs: 1 }}
			>
				<Grid item xs={1}>
					<TextField
						label="New Password"
						variant="standard"
						type="password"
						value={pw}
						error={!!error}
						helperText={error}
						onBlur={() => setTouched(true)}
						onChange={e => setPw(e.target.value)}
					/>
				</Grid>
				<Grid item xs={1}>
					<TextField
						label="Confirm Password"
						variant="standard"
						type="password"
						value={pw2}
						onChange={e => setPw2(e.target.value)}
					/>
				</Grid>
				<Grid item xs={1}>
					<Button disabled={!canSave} onClick={handleUpdate}>
						Save New Password
					</Button>
				</Grid>
			</Grid>
		</>
	);
}
