import type { NextPage } from 'next';

import { AppName } from '@common/constants';
import { ScrollContent } from '@components/scroll-content';
import Head from 'next/head';
import { questionsAnswers } from '@components/questionsAnswers';
import {
	Box,
	Typography,
	Link as MuiLink,
} from '@mui/material';

const FaqPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>{AppName}</title>
				<meta name="description" content={`${AppName} - Bookmarks`} />
			</Head>
			<ScrollContent>
				<Box padding={2} paddingBottom={10}>
					<Box
						component="ul"
						paddingLeft={2}
						paddingBottom={1}
					>
						{questionsAnswers.map(qa => (
							<Box
								component="li"
								paddingBottom={1}
								key={qa.key}
							>
								<strong>
									<MuiLink href={`#${qa.key}`}>{qa.title}</MuiLink>
								</strong>
							</Box>
						))}
					</Box>
					{questionsAnswers.map(qa => (
						<Box paddingBottom={4} key={qa.key}>
							<Typography
								id={qa.key}
								variant="h4"
								component="h2"
							>
								{qa.title}
							</Typography>
							{qa.content}
						</Box>
					))}
				</Box>
			</ScrollContent>
		</>
	);
};

export default FaqPage;
