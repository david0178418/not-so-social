/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import Image from 'next/image';
import botFarmImage from './botfarm.webp';
import { SpecialCharacterCodes } from '@common/constants';
import {
	Box,
	Typography,
	Link as MuiLink,
} from '@mui/material';

const { NBSP } = SpecialCharacterCodes;

export
const questionsAnswers = [
	{
		key: 'what-is-not-so-social',
		title: 'What is NotSo.Social?',
		content: (
			<>
				<Typography paddingBottom={2}>
					<NotSoSocial/>{NBSP}is a microblogging platform similar to Twitter,
					but with some fundamental differences. Rather than rank content
					by "likes" or some other form of straight vote, content is
					ranked by earned points.
				</Typography>

				<Typography paddingBottom={2}>
					First, <NotSoSocial/> removes the "social" from social media
					(as the name implies). By reducing opportunities for bandwagoning
					and in-group signaling,individual thoughts and questions can
					be more freely expressed.
				</Typography>

				<Typography>
					Second, rather than rank content by "likes" or some other
					form of straight vote, content is ranked by points that are
					earned from your activities that are beneficial to the platform.
					This aims to ensure ranking influence is in the hands of those
					that are invested in the platform as opposed to armies of bots
					that can be cheaply created with limitless voting potential.
				</Typography>
			</>
		),
	}, {
		key: 'what-is-the-goal',
		title: 'What is the goal of NotSo.Social?',
		content: (
			<>
				<Typography paddingBottom={2}>
					The guiding principle of <NotSoSocial/> is that the antidote for
					bad ideas is better ideas. And trying to bury bad ideas just
					causes them to take root and metastasize.
				</Typography>

				<Typography>
					There are many alternative platforms that have sprung up in an
					attempt to essentially become "Free Speech Twitter". But they
					largely duplicate the existing platform inheriting all of their
					problems in the process.
				</Typography>
			</>
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

				<Typography>
					Enter, <NotSoSocial/>!
				</Typography>
			</>
		),
	}, {
		key: 'how-are-points-earned',
		title: 'How are points earned?',
		content: (
			<>
				Points are earned through your posts and actions on the site that
				benefit the platform. Some examples include:
				<Box
					component="ul"
					paddingLeft={2}
				>
					<Box component="li" paddingBottom={1}>
						<strong>Signing up!</strong> - The platform doesn't exist
						without you!
					</Box>
					<Box component="li" paddingBottom={1}>
						<strong>Logging in</strong> - Again, the platform doesn't
						exist without you. And being here is even more valuable
						than simply signing up. Consecutive days of logging in
						will be rewarded with larger bonuses.
					</Box>
					<Box component="li" paddingBottom={1}>
						<strong>Creating quality posts</strong> - Similar to a "like/thumbs-up/up-vote",
						users show their appreciation for content by spending points.
						Any points they spend on your posts become available for
						you to boost more content.
					</Box>
					<Box component="li">
						<strong>???</strong> - The idea is still new, so we'll have
						experiment to see how it shakes out. But there will likely
						be awards for certain "achievements" based on your activity.
					</Box>
				</Box>
			</>
		),
	}, {
		key: 'why-half-points',
		title: 'Why do only half of my points get applied to posts I create?',
		content: (
			<>
				<Typography paddingBottom={2}>
					When you create a post, you spend as many of your points as you'd
					like. But in an effort to{NBSP}<Typography component="em">mildly</Typography>{NBSP}
					discourage self promotion, half of the points are burned as a "post fee"
					of sorts.
				</Typography>
				<Typography paddingBottom={2}>
					<NotSoSocial/> is attempting to be a platform that self-corrects
					for spam and bots. The points are the core of that system. And
					the less beneficial it is for an individual to self-promote,
					the less it will be for spam to propagate.
				</Typography>
				<Typography paddingBottom={2}>
					This, however, is an experimental idea. It may change.
				</Typography>
				<Typography paddingBottom={2}>
					Perhaps the act of spending the points is enough of a deterrent.
					And if the user has created enough points to rank themselves
					highly, perhaps this they've earned the right to "buy" the top
					spot. If it's not quality content, then they would have wasted
					their points. And if the community values it, they will be
					rewarded with more points.
				</Typography>
				<Typography>
					We shall see...
				</Typography>
			</>
		),
	}, {
		key: 'wont-feed-be-ruined-buying-top-spot',
		title: 'Won\'t people be able to ruin my feed if they can spend their points to "buy" the top spot?',
		content: (
			<>
				<Typography paddingBottom={2}>
					At the moment, you can view the full history of points spent
					on a post. In the future, you will be able to ignore what
					you consider "spammy" expenses. The points spent by that person
					will no longer influence their feed.
				</Typography>
				<Typography>
					Some of the details on how best to implement this still need
					to be worked out.
				</Typography>
			</>
		),
	}, {
		key: 'is-notso-social-anonymous',
		title: 'Is NotSo.Social an anonymous platform?',
		content: (
			<>
				<Typography paddingBottom={2}>
					Usernames never appear next to a post. It's simply the unique
					identifier you use to log in. However, the primary goal is not
					full anonymity. It's simply to allow your thoughts and posts
					to stand independent of your other posts/thoughts to general
					posters. With enough effort, someone may be able to relate some
					of your posts.  But the average intellectually lazy person
					who would dismiss ideas based on your post history would not
					have easy access to this.
				</Typography>
				<Typography>
					Additionally, <NotSoSocial /> does not require an email or
					other personally identifying information. In the future, you
					will be able to provide an email for password recovery, site updates,
					activity notifications, etc. But all of this will be completely
					optional.
				</Typography>
			</>
		),
	}, {
		key: 'shouldnt-this-be-faq',
		title: 'Shouldn\'t this be called an "FAQ"?',
		content: (
			<>
				Since "FAQ" stands for "Frequently Asked Questions", that's not currently
				possible since as of writing, no one knows about <NotSoSocial/>...<strong>yet!</strong>
			</>
		),
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
