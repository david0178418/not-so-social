import { Post } from '@common/types';
import { formatDate } from '@common/utils';
import {
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';
import Link from 'next/link';

interface Props {
	post: Post;
}

export
function FeedPost(props: Props) {
	const {
		post: {
			_id,
			body,
			title,
			created,
		},
	} = props;

	return (
		<ListItem alignItems="flex-start">
			<ListItemText
				primary={(
					<Link
						passHref
						href={`/p/${_id}`}
					>
						<a>
							<strong>
								{title}
							</strong>
						</a>
					</Link>
				)}
				secondaryTypographyProps={{ component: 'div' }}
				secondary={
					<>
						<Typography
							color="text.primary"
						>
							{formatDate(created)}
						</Typography>
						{body}
					</>
				}
			/>
		</ListItem>
	);
}
