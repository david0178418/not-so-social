import { CancelButton, ConfirmButton } from '@components/common/buttons';
import { useSetAtom } from 'jotai';
import { loadingAtom, pushToastMsgAtom } from '@common/atoms';
import { getLinkPreviewsFromContent, postSave } from '@client/api-calls';
import { useDebounce, useRefreshPage } from '@common/hooks';
import { LinkPreview, LinkPreviewSaveType } from '@common/types';
import { LinkPreviews } from '@components/link-previews';
import { MinPostBodyLength } from '@common/constants';
import { exec } from '@common/utils';
import { InfoIconButton } from '@components/common/info-icon-button';
import {
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	Box,
	Checkbox,
	FormControlLabel,
	Grid,
	TextField,
} from '@mui/material';

interface Props {
	parentId: string;
	onClose(): void;
}

export
// TODO Unify this in some way with creation and eventual edit forms
// perhaps just abstracting logic into a hook, a shared component or some combo
function FeedPostResponseForm(props: Props) {
	const {
		parentId,
		onClose,
	} = props;
	const refreshPage = useRefreshPage();
	const pustToastMsg = useSetAtom(pushToastMsgAtom);
	const setLoading = useSetAtom(loadingAtom);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [nsfw, setNsfw] = useState(false);
	const [nsfl, setNsfl] = useState(false);
	const debouncedBody = useDebounce(body, 750);
	const [points, setPoints] = useState(0);
	const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);
	const abortControllerRef = useRef<AbortController | null>(null);

	// TODO Clean this mess up. Probably factor out into a hook or something
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

	async function handleSave() {
		try {
			setLoading(true);
			console.log(await postSave({
				title,
				body,
				points,
				parentId,
				nsfl,
				nsfw,
				linkPreviews: formatPreviews(linkPreviews),
			}));
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
				<Grid container>
					<Grid item>
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
					<Grid item>
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
			</Box>
			{!!linkPreviews.length && (
				<Box>
					<LinkPreviews linkPreviews={linkPreviews} />
				</Box>
			)}
			<Box sx={{ textAlign: 'right' }}>
				<CancelButton onClick={onClose}/>
				<ConfirmButton onClick={handleSave}>
					Respond
				</ConfirmButton>
			</Box>
		</>
	);
}

function formatPreviews(linkPreviews: LinkPreview[]): LinkPreviewSaveType[] {
	return linkPreviews.map(link => {
		if(link.type === 'link') {
			return link;
		}

		const {
			post,
			...savedProps
		} = link;

		return {
			...savedProps,
			postId: post._id.toString(),
		};
	});
}
