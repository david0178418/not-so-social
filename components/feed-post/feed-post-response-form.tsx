import { useState } from 'react';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { postSave } from '@common/client/api-calls';
import { useRefreshPage } from '@common/hooks';
import {
	Box,
	Grid,
	TextField,
} from '@mui/material';

interface Props {
	parentId: string;
	onClose(): void;
}

export
function FeedPostResponseForm(props: Props) {
	const {
		parentId,
		onClose,
	} = props;
	const refreshPage = useRefreshPage();
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [points, setPoints] = useState(0);

	async function handleSave() {
		try {
			setLoading(true);
			console.log(await postSave({
				title,
				body,
				points,
				parentId,
			}));
			onClose();
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pustToastMsg);
			console.log(e);
		}

		await refreshPage();

		setLoading(false);
	}

	return (
		<>
			<Box
				noValidate
				autoComplete="off"
				component="form"
				sx={{ padding: 3 }}
			>
				<Grid container>
					<Grid item xs>
						<TextField
							autoFocus
							fullWidth
							label="Title"
							variant="standard"
							placeholder="Post title"
							type="text"
							value={title}
							onChange={e => setTitle(e.target.value)}
						/>
					</Grid>
					<Grid item xs={2}>
						<TextField
							fullWidth
							type="number"
							label="Points"
							variant="standard"
							value={points}
							onChange={e => setPoints(+e.target.value)}
						/>
					</Grid>
				</Grid>
				<TextField
					fullWidth
					multiline
					label="Post"
					variant="standard"
					placeholder="Post title"
					type="text"
					minRows={3}
					value={body}
					onChange={e => setBody(e.target.value)}
				/>
			</Box>
			<Box sx={{ textAlign: 'right' }}>
				<CancelButton onClick={onClose}/>
				<ConfirmButton onClick={handleSave}>
					Respond
				</ConfirmButton>
			</Box>
		</>
	);
}
