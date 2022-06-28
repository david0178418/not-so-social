import { Post } from '@common/types';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber, urlJoin } from '@common/utils';
import { useIsLoggedIn } from '@common/hooks';
import { writeToClipboard } from '@common/client/utils';
import { Paths } from '@common/constants';
import Link from 'next/link';
import { DropdownMenu } from '@components/dropdown-menu';
import {
	BoostIcon,
	CommentIcon,
	CopyIcon,
} from '@components/icons';
import {
	Button,
	Grid,
	MenuItem,
	Tooltip,
} from '@mui/material';
import { useSetAtom } from 'jotai';
import { boostPostAtom } from '@common/atoms';

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

	return (
		<>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<Tooltip title="Add Point/Counter Point">
					<Button
						size={Size}
						startIcon={<CommentIcon/>}
						onClick={onCommentClick}
					>
						{''}
					</Button>
				</Tooltip>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<Tooltip title="Boost">
					<Button
						size={Size}
						color="success"
						startIcon={<BoostIcon fontSize="inherit" />}
						onClick={() => setBoostPost(post)}
					>
						{formatCompactNumber(post.points)}
					</Button>
				</Tooltip>
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
				<Tooltip title="Copy Link">
					<Button
						size={Size}
						startIcon={<CopyIcon fontSize="inherit" />}
						onClick={() => writeToClipboard(getItemUrl(post))}
					>
						{''}
					</Button>
				</Tooltip>
			</Grid>
			<Grid
				xs
				item
				sx={{ textAlign: 'center' }}
			>
				<DropdownMenu>
					{post.isOwner && (
						[
							<Link
								key="a"
								passHref
								shallow
								href="/"
							>
								<MenuItem>Edit</MenuItem>
							</Link>,
						]
					)}
					<MenuItem>View Point Activity</MenuItem>
					{!post.isOwner && (
						<MenuItem>Mark as Spam</MenuItem>
					)}
				</DropdownMenu>
			</Grid>
		</>
	);
}
