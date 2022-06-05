import { Post } from '@common/types';
import Link from 'next/link';
import { BookmarkToggle } from './bookmark-toggle';
import { formatCompactNumber } from '@common/utils';
import {
	BoostIcon,
	CommentIcon,
	ConnectPostIcon,
} from '@components/icons';
import {
	Button,
	Grid,
	Tooltip,
} from '@mui/material';
import { useIsLoggedIn } from '@common/hooks';

interface Props {
	post: Post;
	parentId?: string;
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
				<Link
					passHref
					shallow
					href="/"
				>
					<Tooltip title="Connect to Post as Response">
						<Button
							size={size}
							startIcon={<ConnectPostIcon/>}
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
						{formatCompactNumber(post.points || 0)}
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
		</>
	);
}
