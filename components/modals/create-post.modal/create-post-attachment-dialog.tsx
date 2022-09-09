import { useDebouncedCallback } from '@common/hooks';
import type { Post } from '@common/types';

import { useState } from 'react';
import { MongoIdLength, Paths } from '@common/constants';
import { last } from '@common/utils';
import { getPost } from '@common/client/api-calls';
import { CancelButton, ConfirmButton } from '@components/common/buttons';
import { AttachmentIcon } from '@components/icons';
import { FeedPost } from '@components/feed-post';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';

interface Props {
	onAttach(p: Post): void;
}

export
function CreatePostAttachmentDialog(props: Props) {
	const [attachementIdUrl, setAttachmentIdUrl] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [post, setPost] = useState<Post | null>(null);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const { onAttach } = props;

	useDebouncedCallback(attachementIdUrl, 750, async () => {
		if(!attachementIdUrl) {
			setPost(null);
			return;
		}

		const id = last(attachementIdUrl.split(`${Paths.Post}/`));

		if(post) {
			if(post._id === id) {
				return;
			} else {
				setPost(null);
			}
		}

		if(id?.length !== MongoIdLength) {
			setError(true);
			setPost(null);
			return;
		}

		setError(false);
		setLoading(true);

		const result = await getPost(id);

		result ?
			setPost(result) :
			setNotFound(true);

		setLoading(false);
	});

	function handleAttach() {
		post && onAttach(post);
		close();
	}

	function close() {
		setAttachmentIdUrl('');
		setError(false);
		setNotFound(false);
		setPost(null);
		setIsOpen(false);
	}

	return (
		<>
			<Button
				variant="outlined"
				endIcon={<AttachmentIcon/>}
				onClick={() => setIsOpen(true)}
			>
				Attach Post
			</Button>
			<Dialog
				fullWidth
				open={isOpen}
				onClose={close}
			>
				<DialogTitle>Attach Post</DialogTitle>
				<DialogContent>
					{error && (
						<Box marginBottom={2}>
							<Alert severity="error">
								Not a valid post url or ID.
							</Alert>
						</Box>
					)}
					{notFound && (
						<Box marginBottom={2}>
							<Alert severity="error">
								Post not found.
							</Alert>
						</Box>
					)}
					<TextField
						autoFocus
						fullWidth
						margin="dense"
						label="Post ID or URL"
						value={attachementIdUrl}
						onChange={e => setAttachmentIdUrl(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<CancelButton onClick={close}>
						Cancel
					</CancelButton>
					<ConfirmButton
						disabled={!post}
						onClick={handleAttach}
					>
						Add Attachment
					</ConfirmButton>
				</DialogActions>
				{post && (
					<DialogContent>
						<FeedPost post={post}/>
					</DialogContent>
				)}
				{loading && (
					<DialogContent style={{ textAlign: 'center' }}>
						<CircularProgress color="inherit" />
					</DialogContent>
				)}
			</Dialog>
		</>
	);
}
