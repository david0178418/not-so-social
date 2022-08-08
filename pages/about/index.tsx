/* eslint-disable react/no-unescaped-entities */
import type { NextPage } from 'next';

import { AppName, SpecialCharacterCodes } from '@common/constants';
import { ScrollContent } from '@components/scroll-content';
import Head from 'next/head';
import Link from 'next/link';
import { Fragment } from 'react';
import Image from 'next/image';
import botFarmImage from './botfarm.webp';
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

const { NBSP } = SpecialCharacterCodes;

const questionsAnswers = [
	{
		key: 'what-is-not-so-social',
		title: 'What is NotSo.Social?',
		content: (
			<Typography>
				<NotSoSocial/> {NBSP} is a microblogging platform similar to Twitter,
				but with a twist. Rather than rank content by "likes" or some other
				form of straight vote, content is ranked by points where points are
				earned from your activities that are beneficial to the platform
				and users in general.
			</Typography>
		),
	}, {
		key: 'why',
		title: 'Why?',
		content: (
			<>
				<Typography paddingBottom={2}>
					Today, platforms such as Twitter are the defacto town square.
					Anyone at any time can make a post and any one can democratically
					vote to elevate that post with a "like/thumbs-up/up-vote".
					Being the town square, social media has long been a target for
					corporate and, more importantly, political <a href="https://archive.ph/nOzYI#selection-99.0-121.296" target="__blank">astroturfing</a>.
					For every fake account that these bad actors create, they are
					able to cast a vote on an unlimited number of posts, making
					public discourse manipulation relatively easy.
				</Typography>

				<Box sx={{ textAlign: 'center' }}>
					<a href="https://archive.ph/lMySi" target="__blank">
						<Image src={botFarmImage} />
					</a>
					<Typography variant="subtitle2">
						Bot farm busted in Thailand
					</Typography>
				</Box>

				<Typography paddingY={2}>
					In the face of this astroturfing pressure, there is also the pressure
					to self-censor. This comes in the form of profiles and profile
					history. The intellectually lazy can dismiss a "bad faith" idea
					by simply looking for a past opinion they find unsavory. Or perhaps
					the idea can be dismissed by simply looking at the poster's
					choice of username or avatar.
				</Typography>

				<Typography paddingBottom={2} >
					But what if the ability to vote on a post was scarce? What if that
					scarcity was anchored to how much value you brought to the platform?
					And what if your ideas stood on their own, unencumbered by your
					past decisions or the clever username you came up with?
				</Typography>

				<Typography paddingBottom={2}>
					Enter, <NotSoSocial/>!
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

function NotSoSocial() {
	return (
		<Link href="/" passHref>
			<MuiLink>
				NotSo.Social
			</MuiLink>
		</Link>
	);
}
