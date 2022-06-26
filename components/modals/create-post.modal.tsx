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
	Grid,
	TextField,
} from '@mui/material';

export
function CreatePostModal() {
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [points, setPoints] = useState(0);
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
			console.log(await postSave({
				title,
				body,
				points,
			}));
			close();
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pustToastMsg);
			console.log(e);
		}

		setLoading(false);
	}

	function close() {
		setBody('');
		setTitle('');
		setPoints(0);
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
