import { useEffect, useState } from 'react';
import { useInView } from 'react-cool-inview';
import {
	Box,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';

interface Props {
	onMore(): Promise<boolean>;
	isDone?: boolean;
}

export
function LoadMoreButton(props: Props) {
	const {
		onMore,
		isDone: rawIsDone = false,
	} = props;
	const [isLoading, setIsLoading] = useState(true);
	const [isDone, setIsDone] = useState(rawIsDone);
	const { observe } = useInView({ onEnter: handleMore });

	useEffect(() => {
		setIsDone(rawIsDone);
	}, [rawIsDone]);

	async function handleMore() {
		setIsLoading(true);
		const done = await onMore();

		if(done) {
			setIsDone(true);
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
