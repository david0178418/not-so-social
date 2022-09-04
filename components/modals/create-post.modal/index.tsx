import type { LinkPreviewData, Post } from '@common/types';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { useDebounce, useIsLoggedOut } from '@common/hooks';
import { getLinkPreviewsFromContent, postSave } from '@common/client/api-calls';
import { CancelButton, ConfirmButton } from '@components/common/buttons';
import { LinkPreviews } from '@components/link-previews';
import { InfoIconButton } from '@components/common/info-icon-button';
import { CreatePostAttachmentDialog } from './create-post-attachment-dialog';
import {
	CloseIcon,
	InfoIcon,
} from '@components/icons';
import {
	exec,
	formatCompactNumber,
	urlJoin,
} from '@common/utils';
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
	Paths,
} from '@common/constants';
import {
	AppBar,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Grid,
	IconButton,
	Link as MuiLink,
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
	const [nsfw, setNsfw] = useState(false);
	const [nsfl, setNsfl] = useState(false);
	const [points, setPoints] = useState(MinPostCost);
	const debouncedPoints = useDebounce(points, 750);
	const debouncedBody = useDebounce(body, 750);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const [linkPreviews, setLinkPreviews] = useState<LinkPreviewData[]>([]);
	const abortControllerRef = useRef<AbortController | null>(null);
	const [attachments, setAttachments] = useState<Post[]>([]);
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
			console.log(attachments);
			console.log(await postSave({
				title,
				body,
				points,
				nsfl,
				nsfw,
				linkPreviews,
				attachedPostIds: attachments.map(p => p._id || ''),
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
		setLinkPreviews([]);
		setAttachments([]);
		router.back();
	}

	function addAttachment(post: Post) {
		setAttachments([
			post,
			...attachments.filter(p => p._id !== post._id),
		]);
	}

	function removeAttachment(postId: string) {
		setAttachments(attachments.filter(a => a._id !== postId));
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
				<Grid container paddingY={2}>
					<Grid item xs={8}>
						<CreatePostAttachmentDialog onAttach={addAttachment}/>
					</Grid>
					<Grid item xs={2} textAlign="right">
						<FormControlLabel
							control={
								<Checkbox
									value={nsfw}
									onChange={e => setNsfw(e.target.checked)}
								/>
							}
							label={
								<>
									NSFW
									<InfoIconButton label="Contains explicit sexual material." />
								</>
							}
						/>
					</Grid>
					<Grid item xs={2} textAlign="right">
						<FormControlLabel
							control={
								<Checkbox
									value={nsfl}
									onChange={e => setNsfl(e.target.checked)}
								/>
							}
							label={
								<>
									NSFL
									<InfoIconButton label="Contains contains extreme content such as gore or other distirbing material" />
								</>
							}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			{!!linkPreviews.length && (
				<DialogContent>
					<LinkPreviews linkPreviews={linkPreviews} />
				</DialogContent>
			)}
			{!!attachments.length && (
				<DialogContent>
					{attachments.map(a => (
						<Box key={a._id}>
							<IconButton onClick={() => a._id && removeAttachment(a._id)}>
								<CloseIcon/>
							</IconButton>

							<Link target="__blank" href={urlJoin(Paths.Post, a._id)} passHref>
								<Typography
									noWrap
									component={MuiLink}
									title={a.title}
									sx={{
										fontWeight: 'bold',
										display: 'inline',
									}}
								>
									{a.title}
								</Typography>
							</Link>
						</Box>
					))}
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
						href="/faq#why-half-points"
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
