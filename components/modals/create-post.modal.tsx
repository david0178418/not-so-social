import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ModalActions } from '@common/constants';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { useIsLoggedOut } from '@common/hooks';
import { postSave } from '@common/actions';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import { CancelButton } from '@components/common/buttons/cancel.button';
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';

export
function CreatePostModal() {
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const [postTitle, setPostTitle] = useState('');
	const [postBody, setPostBody] = useState('');
	const {
		a: action,
		...newQuery
	} = router.query;
	const actionIsCreatePost = action === ModalActions.CreatePost;
	const isOpen = actionIsCreatePost && !isLoggedOut;

	useEffect(() => {
		if(!actionIsCreatePost) {
			return;
		}

		if(isLoggedOut) {
			router.replace({
				pathname: router.pathname,
				query: newQuery,
			}, undefined, { shallow: true });
		}

	}, [actionIsCreatePost, isLoggedOut]);

	async function handleSave() {
		try {
			setLoading(true);
			console.log(await postSave(postTitle, postBody));
			close();
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pustToastMsg);
			console.log(e);
		}

		setLoading(false);
	}

	function close() {
		setPostBody('');
		setPostTitle('');
		router.back();
	}

	return (
		<Dialog open={isOpen}>
			<DialogTitle>
				Create Post
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
			</DialogContent>
			<DialogActions>
				<Link
					replace
					shallow
					passHref
					href={{
						pathname: router.pathname,
						query: newQuery,
					}}
				>
					<CancelButton />
				</Link>
				<ConfirmButton onClick={handleSave}>
					Post
				</ConfirmButton>
			</DialogActions>
		</Dialog>
	);
}
