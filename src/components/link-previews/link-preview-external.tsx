import { LinkPreviewData } from '@common/types';
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Typography,
} from '@mui/material';

interface Props {
	linkPreview: LinkPreviewData;
}

export
function LinkPreviewExternal(props: Props) {
	const {
		linkPreview: {
			url,
			title,
			siteName,
			description,
			images,
		},
	} = props;
	const image = images[0] as string | undefined;
	return (
		<Card variant="outlined">
			<CardActionArea
				href={url}
				target="__blank"
				sx={{
					display: 'flex',
					flexDirection: {
						xs: 'column',
						md: 'row',
					},
				}}
			>
				{image && (
					<CardMedia
						component="img"
						image={image}
						sx={{
							maxHeight: '100%',
							maxWidth: {
								xs: '100%',
								md: '50%',
							},
						}}
					/>
				)}
				<Box sx={{
					display: 'flex',
					flexDirection: 'column',
				}}>
					<CardContent sx={{ flex: '1 0 auto' }}>
						<Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
							{siteName}
						</Typography>
						<Typography variant="h6" component="div">
							{title}
						</Typography>
						<Typography >
							{description}
						</Typography>
					</CardContent>
				</Box>
			</CardActionArea>
		</Card>
	);
}
