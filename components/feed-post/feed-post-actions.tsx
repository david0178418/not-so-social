import { Post } from '@common/types';
import Link from 'next/link';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber, urlJoin } from '@common/utils';
import { useIsLoggedIn } from '@common/hooks';
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
import { writeToClipboard } from '@common/client/utils';
import { Paths } from '@common/constants';

interface Props {
	post: Post;
	parentId?: string;
}

function getItemUrl(item: Post) {
	if(!item._id) {
		return '';
	}

	return urlJoin(location.host, Paths.Post, item._id);
}

export
function PostActions(props: Props) {
	const { post } = props;
	const size = 'medium';
	const isLoggedIn = useIsLoggedIn();

	return (
		<>
			<Grid
				xs
				item
				style={{ textAlign: 'center' }}
			>
				<Link
					passHref
					shallow
					href="/"
				>
					<Tooltip title="Add Point/Counter Point">
						<Button
							size={size}
							startIcon={<CommentIcon/>}
						>
							{''}
						</Button>
					</Tooltip>
				</Link>
			</Grid>
			<Grid
				xs
				item
				style={{ textAlign: 'center' }}
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
				style={{ textAlign: 'center' }}
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
				style={{ textAlign: 'center' }}
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
