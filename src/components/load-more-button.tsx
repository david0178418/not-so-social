import { useState } from 'react';
import { useInView } from 'react-cool-inview';
import {
	Box,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';

interface Props {
	isDone?: boolean;
	onMore(): Promise<any>;
}

export
function LoadMoreButton(props: Props) {
	const {
		onMore,
		isDone,
	} = props;
	const [isLoading, setIsLoading] = useState(true);
	const { observe } = useInView({ onEnter: handleMore });

	async function handleMore() {
		setIsLoading(true);
		await onMore();

		setIsLoading(false);
	}

	return (
		<Box paddingTop={5} paddingBottom={8}>
			{isDone ? (
				<Typography>
					End of Feed
				</Typography>
			) : (
				<Button
					fullWidth
					ref={observe}
					disabled={isLoading}
					endIcon={
						isLoading ?
							<CircularProgress color="inherit" /> :
							null
					}
				>
					{isLoading ?
						'Loading' :
						'Load More'
					}
				</Button>
			)}
		</Box>
	);
}
