import { useState } from 'react';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import {
	Box,
	TextField,
} from '@mui/material';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { postSave } from '@common/actions';
import { useRefreshPage } from '@common/hooks';

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
	const [postTitle, setPostTitle] = useState('');
	const [postBody, setPostBody] = useState('');

	async function handleSave() {
		try {
			setLoading(true);
			console.log(await postSave(postTitle, postBody, parentId));
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
				<CancelButton onClick={onClose}/>
				<ConfirmButton onClick={handleSave}>
					Respond
				</ConfirmButton>
			</Box>
		</>
	);
}
