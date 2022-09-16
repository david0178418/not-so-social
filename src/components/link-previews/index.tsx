import { LinkPreviewData } from '@common/types';
import { ArrowLeftIcon, ArrowRightIcon } from '@components/icons';
import { useState } from 'react';
import { LinkPreview } from './link-preview';
import {
	ButtonGroup,
	IconButton,
	Typography,
} from '@mui/material';

interface Props {
	linkPreviews: LinkPreviewData[];
}

export
function LinkPreviews(props: Props) {
	const [activePreviewIndex, setActiveIndexPreview] = useState(0);
	const { linkPreviews } = props;
	const activePreview = linkPreviews[activePreviewIndex];

	function handleLeft() {
		setActiveIndexPreview(
			!activePreviewIndex ?
				linkPreviews.length - 1 :
				activePreviewIndex - 1,
		);
	}

	function handleRight() {
		setActiveIndexPreview(
			activePreviewIndex === linkPreviews.length - 1 ?
				0 :
				activePreviewIndex + 1,
		);
	}

	return (
		<>
			{(linkPreviews.length > 1) && (
				<ButtonGroup
					disableElevation
					sx={{ alignItems: 'center' }}
				>
					<IconButton onClick={handleLeft}>
						<ArrowLeftIcon />
					</IconButton>
					<Typography component="div" color="text.secondary">
						{activePreviewIndex + 1}/{linkPreviews.length}
					</Typography>
					<IconButton onClick={handleRight}>
						<ArrowRightIcon />
					</IconButton>
				</ButtonGroup>
			)}
			<LinkPreview
				key={activePreview.url}
				linkPreview={activePreview}
			/>
		</>
	);
}
