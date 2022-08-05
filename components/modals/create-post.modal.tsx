import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { useDebounce, useIsLoggedOut } from '@common/hooks';
import { getLinkPreviewsFromContent, postSave } from '@common/client/api-calls';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { exec, formatCompactNumber } from '@common/utils';
import { LinkPreviews } from '@components/link-previews';
import { CloseIcon, InfoIcon } from '@components/icons';
import { LinkPreviewData } from '@common/types';
import {
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	MinPostBodyLength,
	MinPostCost,
	ModalActions,
	OwnPostRatio,
} from '@common/constants';
import {
	AppBar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';

export
function CreatePostModal() {
	const pushToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [points, setPoints] = useState(MinPostCost);
	const debouncedPoints = useDebounce(points, 750);
	const debouncedBody = useDebounce(body, 750);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const [linkPreviews, setLinkPreviews] = useState<LinkPreviewData[]>([]);
	const abortControllerRef = useRef<AbortController | null>(null);
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

	useEffect(() => {
		if(debouncedPoints >= MinPostCost) {
			return;
		}

		setPoints(MinPostCost);
		pushToastMsg(`Must spend at least ${MinPostCost}pts`);
	}, [debouncedPoints]);

	// TODO Clean this mess up
	useEffect(() => {
		if(debouncedBody.length < MinPostBodyLength) {
			setLinkPreviews([]);
			return;
		}

		exec(async () => {
			const controller = new AbortController();
			abortControllerRef.current = controller;
			const result = await getLinkPreviewsFromContent(debouncedBody, controller.signal);

			if(result?.ok && result.data?.previews.length) {
				setLinkPreviews(result.data.previews);
			} else {
				setLinkPreviews([]);
			}

			if(abortControllerRef.current === controller) {
				abortControllerRef.current = null;
			}
		});
	}, [debouncedBody]);

	useEffect(() => {
		if(!abortControllerRef.current) {
			return;
		}

		abortControllerRef.current.abort();

		abortControllerRef.current = null;
	}, [body]);
	// END Clean this mess up

	async function handleSave() {
		try {
			setLoading(true);
			console.log(await postSave({
				title,
				body,
				points,
				linkPreviews,
			}));
			close();
		} catch(e: any) {
			const { errors = ['Something went wrong. Try again.'] } = e;

			errors.map(pushToastMsg);
			console.log(e);
		}

		setLoading(false);
	}

	function close() {
		setBody('');
		setTitle('');
		setPoints(MinPostCost);
		router.back();
	}

	return (
		<Dialog
			fullWidth
			open={isOpen}
			fullScreen={fullScreen}
			maxWidth="md"
		>
			{fullScreen && (
				<AppBar sx={{ position: 'relative' }}>
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Create Post
						</Typography>
						<IconButton
							edge="end"
							color="inherit"
							onClick={close}
						>
							<CloseIcon />
						</IconButton>
					</Toolbar>
				</AppBar>
			)}
			{!fullScreen && (
				<DialogTitle>
					Create Post
				</DialogTitle>
			)}
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
						<Grid item xs={2} lg={1}>
							<TextField
								fullWidth
								type="number"
								label="Point Spend"
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
			{!!linkPreviews.length && (
				<DialogContent>
					<LinkPreviews linkPreviews={linkPreviews} />
				</DialogContent>
			)}
			<DialogActions sx={{
				flexDirection: {
					xs: 'column',
					sm: 'row',
				},
				gap: 2,
			}}>
				<Link
					replace
					shallow
					passHref
					href={{
						pathname: router.pathname,
						query: newQuery,
					}}
				>
					<CancelButton fullWidth={fullScreen} />
				</Link>
				<ConfirmButton onClick={handleSave} fullWidth={fullScreen}>
						Post for {points}pts
						(rank with {formatCompactNumber(Math.floor(points * OwnPostRatio))}pts)
				</ConfirmButton>
			</DialogActions>
			<DialogContent>
				<DialogContentText>
					<Button
						color="inherit"
						size="small"
						// ADD INFO PAGE
						href="/"
						target="__blank"
						endIcon={<InfoIcon fontSize="small" />}
					>
						<em>
						Why are only half of the spent points applied?

						</em>
					</Button>
				</DialogContentText>
			</DialogContent>
		</Dialog>
	);
}
