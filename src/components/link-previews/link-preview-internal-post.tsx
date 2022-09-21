import type { AttachmentPostPartial } from '@common/types';

import { urlJoin } from '@common/utils';
import { Paths } from '@common/constants';
import { RepostIcon } from '@components/icons';
import {
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Typography,
} from '@mui/material';

interface Props {
	annotation?: string;
	post: AttachmentPostPartial;
}

export
function LinkPreviewInternalPost(props: Props) {
	const {
		annotation = '',
		post,
	} = props;

	return (
		<Card variant="outlined">
			<CardActionArea
				target="__blank"
				href={urlJoin(Paths.Post, post._id)}
			>
				<CardContent>
					<Chip
						size="small"
						color="primary"
						label="Repost"
						icon={<RepostIcon />}
					/>
					<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
						{annotation}
					</Typography>
					<Typography
						noWrap
						title={post.title}
						sx={{
							fontWeight: 'bold',
							display: 'block',
						}}
					>
						{post.title}
					</Typography>
					<Typography component="pre">
						{post.body}
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}
