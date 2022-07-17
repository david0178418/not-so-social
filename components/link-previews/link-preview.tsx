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
			<CardActionArea sx={{ display: 'flex' }} href={url} target="__target">
				<CardMedia
					component="img"
					image={image}
					sx={{
						height: '175px',
						width: '175px',
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
