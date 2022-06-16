import { useState } from 'react';
import {
	Box,
	TextField,
} from '@mui/material';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { ConfirmButton } from '@components/common/buttons/confirm.button';

export
function CreateResponseForm() {
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
				<CancelButton />
				<ConfirmButton>
					Respond
				</ConfirmButton>
			</Box>
		</>
	);
}
