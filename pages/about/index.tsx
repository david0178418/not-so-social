import type { NextPage } from 'next';

import { AppName } from '@common/constants';
import { ScrollContent } from '@components/scroll-content';
import Head from 'next/head';
import { questionsAnswers } from './questionsAnswers';
import {
	Box,
	Typography,
	Link as MuiLink,
} from '@mui/material';

const AboutPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>{AppName}</title>
				<meta name="description" content={`${AppName} - Bookmarks`} />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<ScrollContent>
				<Box padding={2}>
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
								<MuiLink href={`#${qa.key}`}>{qa.title}</MuiLink>
							</Box>
						))}
					</Box>
					{questionsAnswers.map(qa => (
						<Box paddingBottom={2} key={qa.key}>
							<Typography id={qa.key} variant="h4" component="h2" >
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

export default AboutPage;
