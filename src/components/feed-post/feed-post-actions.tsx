import Link from 'next/link';
import { Post } from '@common/types';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber, urlJoin } from '@common/utils';
import { useIsLoggedIn } from '@common/hooks';
import { writeToClipboard } from '@client/client-utils';
import { ModalActions, Paths } from '@common/constants';
import { DropdownMenu } from '@components/dropdown-menu';
import { useSetAtom } from 'jotai';
import { boostPostAtom } from '@common/atoms';
import { LoginFallbackLink } from '@components/common/login-fallback-link';
import { useRouter } from 'next/router';
import {
	BoostIcon,
	CommentIcon,
	RepostIcon,
} from '@components/icons';
import {
	Button,
	Grid,
	MenuItem,
	Tooltip,
} from '@mui/material';

interface Props {
	post: Post;
	parentId?: string;
	onCommentClick(): void
}

function getItemUrl(item: Post) {
	if(!item._id) {
		return '';
	}

	return urlJoin(location.host, Paths.Post, item._id);
}

const Size = 'medium';

export
function PostActions(props: Props) {
	const {
		post,
		onCommentClick,
	} = props;
	const setBoostPost = useSetAtom(boostPostAtom);
	const isLoggedIn = useIsLoggedIn();
	const router = useRouter();
	const {
		pathname,
		query,
	} = router;

	return (
		<Grid container columns={4} alignItems="flex-end">
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<LoginFallbackLink>
					<Tooltip title="Respond">
						<Button
							size={Size}
							startIcon={<CommentIcon/>}
							onClick={onCommentClick}
						>
							{formatCompactNumber(post.replyCount)}
						</Button>
					</Tooltip>
				</LoginFallbackLink>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<LoginFallbackLink>
					<Tooltip title="Repost">

						<Link
							shallow
							href={{
								pathname,
								query: {
									a: ModalActions.CreatePost,
									r: post._id,
									...query,
								},
							}}
						>
							<Button
								size={Size}
								startIcon={<RepostIcon/>}
							>
								{formatCompactNumber(post.attachedToPosts.length)}
							</Button>
						</Link>
					</Tooltip>
				</LoginFallbackLink>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<LoginFallbackLink>
					<Tooltip title="Boost">
						<Button
							size={Size}
							color="success"
							startIcon={<BoostIcon fontSize="inherit" />}
							onClick={() => setBoostPost(post)}
						>
							{formatCompactNumber(post.points || post.totalPoints)}
						</Button>
					</Tooltip>
				</LoginFallbackLink>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<BookmarkToggle
					size={Size}
					isLoggedIn={!!isLoggedIn}
					post={post}
				/>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<DropdownMenu>
					{/* TODO
					{post.isOwner && (
						[
							<Link
								key="a"
								passHref
								shallow
								href={Paths.Home}
							>
								<MenuItem>Edit</MenuItem>
							</Link>,
						]
					)} */}
					<Link
						passHref
						shallow
						href={`${Paths.Post}/${post._id}/pts`}
					>
						<MenuItem>View Point Activity</MenuItem>
					</Link>
					{!post.isOwner && (
						<MenuItem>Mark as Spam</MenuItem>
					)}

					<MenuItem onClick={() => writeToClipboard(getItemUrl(post))} >
						Copy Link
					</MenuItem>
				</DropdownMenu>
			</Grid>
		</Grid>
	);
}
