import { useState } from 'react';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import {
	Box,
	TextField,
} from '@mui/material';

interface Props {
	onCancel(): void;
	onConfirm(): void;
}

export
function CreateResponseForm(props: Props) {
	const {
		onCancel,
		onConfirm,
	} = props;
	const [postTitle, setPostTitle] = useState('');
	const [postBody, setPostBody] = useState('');

	return (
		<>
			<Box
				noValidate
				autoComplete="off"
				component="form"
				sx={{ padding: 3 }}
			>
				<TextField
					autoFocus
					fullWidth
					label="Title"
					variant="standard"
					placeholder="Post title"
					type="text"
					value={postTitle}
					onChange={e => setPostTitle(e.target.value)}
				/>
				<TextField
					fullWidth
					multiline
					label="Post"
					variant="standard"
					placeholder="Post title"
					type="text"
					minRows={3}
					value={postBody}
					onChange={e => setPostBody(e.target.value)}
				/>
			</Box>
			<Box sx={{ textAlign: 'right' }}>
				<CancelButton onClick={onCancel}/>
				<ConfirmButton onClick={onConfirm}>
					Respond
				</ConfirmButton>
			</Box>
		</>
	);
}
