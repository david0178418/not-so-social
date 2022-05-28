import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import { ModalActions } from '@common/constants';
import { useAtom } from 'jotai';
import { pushToastMsgAtom } from '@common/atoms';
import { useIsLoggedOut } from '@common/hooks';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';

export
function CreatePostModal() {
	const [, pustToastMsg] = useAtom(pushToastMsgAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
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

	return (
		<Dialog open={isOpen}>
			<DialogTitle>
				Create Post
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Foo
				</DialogContentText>
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
