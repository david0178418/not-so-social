import type { NextPage } from 'next';

import { AppName } from '@common/constants';
import { ScrollContent } from '@components/scroll-content';
import {
	Box, Link as MuiLink, Typography,
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { Fragment } from 'react';

const AboutPage: NextPage = () => {
	return (
		<>
			<Head>
				<title>{AppName}</title>
				<meta name="description" content={`${AppName} - Bookmarks`} />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<ScrollContent>
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
						<Typography>
							{qa.content}
						</Typography>
					</Box>
				))}
			</ScrollContent>
		</>
	);
};

export default AboutPage;

const questionsAnswers = [
	{
		key: 'what-is-not-so-social',
		title: 'What is NotSo.Social?',
		content: (
			<>
				<Link href="/" passHref>
					<MuiLink>
						NotSo.Social
					</MuiLink>
				</Link> is an attempt to...
			</>
		),
	}, {
		key: 'why',
		title: 'Why?',
		content: 'TODO',
	}, {
		key: 'how-are-points-earned',
		title: 'How are points earned?',
		content: 'TODO',
	},
];
