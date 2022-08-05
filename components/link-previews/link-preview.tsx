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
function LinkPreview(props: Props) {
	const {
		linkPreview: {
			url,
			title,
			siteName,
			description,
			images,
		},
	} = props;
	const image = images[0];
	return (
		<Card variant="outlined">
			<CardActionArea
				target="__target"
				href={url}
				sx={{
					display: 'flex',
					flexDirection: {
						xs: 'column',
						md: 'row',
					},
				}}
			>
				<CardMedia
					component="img"
					image={image}
					sx={{
						maxHeight: {
							xs: 'auto',
							md: '175px',
						},
						maxWidth: {
							xs: '100%',
							md: 'auto',
						},
					}}
				/>
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
