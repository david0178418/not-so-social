import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ModalActions } from '@common/constants';
import { useAtom } from 'jotai';
import { pushToastMsgAtom } from '@common/atoms';
import { useIsLoggedOut } from '@common/hooks';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from '@mui/material';

export
function CreatePostModal() {
	const [, pustToastMsg] = useAtom(pushToastMsgAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const [postTitle, setPostTitle] = useState('');
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
			//
		} catch(e) {
			pustToastMsg('Something went wrong. Try again.');
			console.log(e);
		}
	}

	function handleKeyUp(a: any) {
		console.log(a);
	}

	return (
		<Dialog open={isOpen}>
			<DialogTitle>
				Create Post
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Foo
				</DialogContentText>
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
						onKeyUp={e => handleKeyUp(e.key)}
						onChange={e => setPostTitle(e.target.value)}
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
						Cancel
					</Button>
				</Link>
				<Button onClick={handleSave}>
					Post
				</Button>
			</DialogActions>
		</Dialog>
	);
}
