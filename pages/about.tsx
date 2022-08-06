import type { NextPage } from 'next';

import { AppName, SpecialCharacterCodes } from '@common/constants';
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
						{qa.content}
					</Box>
				))}
			</ScrollContent>
		</>
	);
};

export default AboutPage;

const {
	NBSP,
	QUOTE,
} = SpecialCharacterCodes;

const questionsAnswers = [
	{
		key: 'what-is-not-so-social',
		title: 'What is NotSo.Social?',
		content: (
			<Typography>
				<Link href="/" passHref>
					<MuiLink>
						NotSo.Social
					</MuiLink>
				</Link>{NBSP}
				is a microblogging platform similar to Twitter, but with a twist.
				Rather than rank content by {QUOTE}likes{QUOTE} or some other form of straight
				vote, content is ranked by points where points are earned from your
				activities that are beneficial to the platform and users in general.
			</Typography>
		),
	}, {
		key: 'why',
		title: 'Why?',
		content: (
			<>
				<Typography paddingBottom={2}>
					Once upon a time, platforms such as Twitter and Reddit where bastions
					of free speech. They disrupted the news business by more efficiently
					spreading news and facilitating open discussion. But a decade or so
					later, the free flow of ideas has been significantly limited. These
					corporate giants now stifle even common ideas that are found unacceptable
					to the sensibilities of the NY/Silicon Valley elite.
				</Typography>

				<Typography paddingBottom={2}>
					But how did these once counter-culter bastions of freespeech become the
					censors?
				</Typography>
			</>
		),
	}, {
		key: 'how-are-points-earned',
		title: 'How are points earned?',
		content: 'TODO',
	}, {
		key: 'shouldnt-this-be-faq',
		title: 'Shouldn\'t this be called an "FAQ"?',
		content: 'TODO',
	},
];
