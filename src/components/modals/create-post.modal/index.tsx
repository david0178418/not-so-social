import type { LinkPreviewType } from '@common/types';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { useDebounce, useIsLoggedOut } from '@common/hooks';
import { CancelButton, ConfirmButton } from '@components/common/buttons';
import { LinkPreviews } from '@components/link-previews';
import { InfoIconButton } from '@components/common/info-icon-button';
import { exec, inRange } from '@common/utils';
import { TextFieldLengthValidation } from '@components/common/text-field-length-validation';
import { postToAttachmentPostPartial } from '@server/transforms/client';
import {
	getLinkPreviewsFromContent,
	getPost,
	postSave,
} from '@client/api-calls';
import {
	CloseIcon,
	InfoIcon,
} from '@components/icons';
import {
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	MaxPostBodyLength,
	MaxPostTitleLength,
	MinPostBodyLength,
	MinPostCost,
	MinPostTitleLength,
	ModalActions,
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
	const [textLinkPreviews, setTextLinkPreviews] = useState<LinkPreviewType[]>([]);
	const [manualLinkPreviews, setManualLinkPreviews] = useState<LinkPreviewType[]>([]);
	const debouncedPoints = useDebounce(points, 750);
	const debouncedBody = useDebounce(body, 750);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const abortControllerRef = useRef<AbortController | null>(null);
	const {
		a: action,
		r: reposts,
		...newQuery
	} = router.query;

	// TODO Clean up this hideous dedupe
	const linkPreviews = manualLinkPreviews
		.concat(textLinkPreviews)
		.filter((i, index, arr) => {
			if(i.type !== 'post') {
				return i;
			}

			return !arr
				.slice(index + 1)
				.find(i2 => i2.type === 'post' && i2.post._id === i.post._id);
		});
	const actionIsCreatePost = action === ModalActions.CreatePost;
	const isOpen = actionIsCreatePost && !isLoggedOut;
	const isValid = (
		points >= MinPostCost &&
		inRange(body.length, MinPostBodyLength, MaxPostBodyLength) &&
		inRange(title.length, MinPostTitleLength, MaxPostTitleLength)
	);

	useEffect(() => {
		exec(async () => {
			if(!reposts || Array.isArray(reposts)) {
				setManualLinkPreviews([]);
				return;
			}

			const repost = await getPost(reposts);

			if(!repost) {
				return;
			}

			setManualLinkPreviews([{
				annotation: '',
				post: postToAttachmentPostPartial(repost),
				type: 'post',
			}]);
		});
	}, [reposts]);

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
			setTextLinkPreviews([]);
			return;
		}

		exec(async () => {
			const controller = new AbortController();
			abortControllerRef.current = controller;
			const result = await getLinkPreviewsFromContent(debouncedBody, controller.signal);

			if(result?.ok && result.data?.previews.length) {
				setTextLinkPreviews(result.data.previews);
			} else {
				setTextLinkPreviews([]);
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
				nsfl,
				nsfw,
				linkPreviews: linkPreviews.map(a => ({
					...a,
					postId: (a as any).post?._id,
				})),
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
		setManualLinkPreviews([]);
		setTextLinkPreviews([]);
		router.back();
	}

	if(!isOpen) {
		// TODO Figure out weird issue with background overlay persisting in
		// some instances. May be related to the "shallow" prop on NextJS Link
		return null;
	}

	return (
		<Dialog
			fullWidth
			open
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
							<TextFieldLengthValidation
								autoFocus
								fullWidth
								label="Title"
								variant="standard"
								placeholder="Post title"
								type="text"
								maxLength={MaxPostTitleLength}
								minLength={MinPostTitleLength}
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
					<TextFieldLengthValidation
						fullWidth
						multiline
						label="Post"
						variant="standard"
						placeholder="Post"
						type="text"
						maxLength={MaxPostBodyLength}
						minLength={MinPostBodyLength}
						minRows={3}
						value={body}
						onChange={e => setBody(e.target.value)}
					/>
				</Box>
				<Grid container paddingY={2}>
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
				<ConfirmButton
					onClick={handleSave}
					fullWidth={fullScreen}
					disabled={!isValid}
				>
					Spend {points}pts to Post
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
