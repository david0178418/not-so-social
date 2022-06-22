import { Post } from '@common/types';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber, urlJoin } from '@common/utils';
import { useIsLoggedIn } from '@common/hooks';
import { writeToClipboard } from '@common/client/utils';
import { Paths } from '@common/constants';
import Link from 'next/link';
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
import { DropdownMenu } from '@components/dropdown-menu';

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

export
function PostActions(props: Props) {
	const {
		post,
		onCommentClick,
	} = props;
	const size = 'medium';
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
						size={size}
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
						size={size}
						color="success"
						startIcon={<BoostIcon fontSize="inherit" />}
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
					size={size}
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
						size={size}
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
							<MenuItem key="b">Abandon Ownership</MenuItem>,
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
