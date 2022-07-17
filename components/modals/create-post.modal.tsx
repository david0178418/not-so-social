import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	useEffect, useRef, useState,
} from 'react';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { useDebounce, useIsLoggedOut } from '@common/hooks';
import { getLinkPreviewsFromContent, postSave } from '@common/client/api-calls';
import { ConfirmButton } from '@components/common/buttons/confirm.button';
import { CancelButton } from '@components/common/buttons/cancel.button';
import { exec, formatCompactNumber } from '@common/utils';
import { InfoIconButton } from '@components/common/info-icon-button';
import { LinkPreviews } from '@components/link-previews';
import { CloseIcon } from '@components/icons';
import { LinkPreviewData } from '@common/types';
import {
	MinPostBodyLength,
	MinPostCost,
	ModalActions,
	OwnPostRatio,
} from '@common/constants';
import {
	AppBar,
	Box,
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
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const isLoggedOut = useIsLoggedOut();
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const debouncedBody = useDebounce(body, 1500);
	const [points, setPoints] = useState(MinPostCost);
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

	// TODO Clean this mess up
	useEffect(() => {
		if(debouncedBody.length < MinPostBodyLength) {
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
			<DialogContent>
				<DialogContentText>
					<em>
						Post with {formatCompactNumber(Math.floor(points * OwnPostRatio))}pts
						<InfoIconButton
							label="When creating or boosting your own post, half of the points spent are applied."
							placement="right"
						/>
					</em>
				</DialogContentText>
			</DialogContent>
		</Dialog>
	);
}

// const linkPreviews = [
// 	{
// 		url: 'https://odysee.com/@samtime:1/what-really-happens-when-you-click:9',
// 		title: 'What REALLY Happens When You Click Enhance',
// 		siteName: 'Odysee',
// 		description: `What would happen if you click “enhance” on a photo in 2022? Will it turn out just like the movies?!

// FUNKY TIME WEBSITE: https://funkytime.tv
// SUPPORT: https://funkytime.tv/patriot-signup/
// MERCH: http...`,
// 		mediaType: 'video.other',
// 		contentType: 'text/html',
// 		images: [
// 			'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbnails.lbry.com/XHKU82RjbQs',
// 		],
// 		videos: [
// 			{
// 				url: 'https://odysee.com/$/embed/what-really-happens-when-you-click/9b48bff88f91220fbf146a662dbf802b6b0f833c',
// 				secureUrl: 'https://odysee.com/$/embed/what-really-happens-when-you-click/9b48bff88f91220fbf146a662dbf802b6b0f833c',
// 				type: 'text/html',
// 				width: '1920',
// 				height: '1080',
// 			},
// 		],
// 		favicons: [
// 			'https://odysee.com/public/favicon-spaceman.png',
// 			'https://odysee.com/public/favicon-spaceman.png',
// 		],
// 	},
// 	// {
// 	// 	url: 'https://www.youtube.com/watch?v=S_hS-JXoTMk',
// 	// 	title: ' - YouTube',
// 	// 	description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
// 	// 	mediaType: 'website',
// 	// 	contentType: 'text/html',
// 	// 	images: [ ],
// 	// 	videos: [ ],
// 	// 	favicons: [
// 	// 		'https://www.youtube.com/s/desktop/cafdf09f/img/favicon_32x32.png',
// 	// 		'https://www.youtube.com/s/desktop/cafdf09f/img/favicon_48x48.png',
// 	// 		'https://www.youtube.com/s/desktop/cafdf09f/img/favicon_96x96.png',
// 	// 		'https://www.youtube.com/s/desktop/cafdf09f/img/favicon_144x144.png',
// 	// 		'https://www.youtube.com/s/desktop/cafdf09f/img/favicon.ico',
// 	// 	],
// 	// },
// 	{
// 		url: 'https://odysee.com/@SciFi4Me',
// 		title: 'SciFi4Me TV',
// 		siteName: 'Odysee',
// 		description: `Science Fiction, Fantasy, Horror.
// 		Our mission is to provide objective and accurate news and well-reasoned opinions without malice or prejudice. That means you can disagree with us, and we won't call y...`,
// 		mediaType: 'website',
// 		contentType: 'text/html',
// 		images: [
// 			'https://thumbnails.odycdn.com/card/s:1280:720/quality:85/plain/https://thumbs.odycdn.com/ebe4ed3d26466260d31604e228b431e5.gif',
// 		],
// 		videos: [ ],
// 		favicons: [
// 			'https://odysee.com/public/favicon-spaceman.png',
// 			'https://odysee.com/public/favicon-spaceman.png',
// 		],
// 	},
// ];
