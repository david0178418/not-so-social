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
	onDone(): void;
	onMore(): Promise<boolean>;
}

export
function LoadMoreButton(props: Props) {
	const {
		onMore,
		isDone,
		onDone,
	} = props;
	const [isLoading, setIsLoading] = useState(true);
	const { observe } = useInView({ onEnter: handleMore });

	async function handleMore() {
		setIsLoading(true);
		const done = await onMore();

		if(done) {
			onDone();
		}

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
