import { Post } from '@common/types';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber, urlJoin } from '@common/utils';
import { useIsLoggedIn } from '@common/hooks';
import { writeToClipboard } from '@common/client/utils';
import { Paths } from '@common/constants';
import {
	BoostIcon,
	CommentIcon,
	CopyIcon,
} from '@components/icons';
import {
	Button,
	Grid,
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
		</>
	);
}
