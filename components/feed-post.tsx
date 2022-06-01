import { Post } from '@common/types';
import { formatDate } from '@common/utils';
import {
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';

interface Props {
	post: Post;
}

export
function FeedPost(props: Props) {
	const {
		post: {
			body,
			title,
			created,
		},
	} = props;

	return (
		<ListItem alignItems="flex-start">
			<ListItemText
				primary={title}
				secondary={
					<>
						<Typography
							sx={{ display: 'inline' }}
							component="span"
							variant="body2"
							color="text.primary"
						>
							{formatDate(created)}
						</Typography>
						{` - ${body}`}
					</>
				}
			/>
		</ListItem>
	);
}
