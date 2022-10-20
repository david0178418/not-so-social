import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { fetchFocusedPost } from '@server/queries';
import { BackIcon } from '@components/icons';
import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { useRouteBackDefault } from '@common/hooks';
import { getServerSession } from '@server/auth-options';
import { Seo } from '@components/seo';
import { useState } from 'react';
import {
	AppName,
	Paths,
	SpecialCharacterCodes,
} from '@common/constants';
import {
	Box,
	IconButton,
	Tab,
	Tabs,
	Typography,
} from '@mui/material';

enum Section {
	Reposts,
	Responses,
}

interface Props {
	data: AsyncFnReturnType<typeof fetchFocusedPost>;
}

const PostPage: NextPage<Props> = (props) => {
	const [activeSection, setActiveSection] = useState(Section.Responses);
	const routeBack = useRouteBackDefault();
	const {
		data: {
			post,
			attachedToPosts,
			responses,
			lv2Responses,
		},
	} = props;

	const {
		title = '',
		description = '',
	} = post ? {
		title: `"${post.title}" - ${AppName}`,
		description: `${post.body}`,
	} : {};

	return (
		<>
			<Seo
				title={title}
				description={description}
				path={`${Paths.Post}/${post?._id}`}
			/>
			<Head>
				<title>{AppName}</title>
			</Head>
			<ScrollContent
				header={
					<Box sx={{
						paddingTop: 1,
						paddingBottom: 2,
					}}>
						<Typography variant="h5" component="div" gutterBottom>
							{/** TODO Capture direct links and send them to home page */}
							<IconButton color="primary" onClick={routeBack}>
								<BackIcon />
							</IconButton>{SpecialCharacterCodes.NBSP}
							Post
						</Typography>
					</Box>
				}
			>
				{post && (
					<FeedPost
						borderless
						post={post}
					/>
				)}
				<Box sx={{
					paddingTop: 1,
					borderBottom: 1,
					borderColor: 'divider',
				}}>
					<Tabs
						variant="fullWidth"
						value={activeSection}
						onChange={(e, newSection) => setActiveSection(newSection)}
					>
						<Tab
							label="Responses"
							value={Section.Responses}
						/>
						<Tab
							label="Reposts"
							value={Section.Reposts}
						/>
					</Tabs>
				</Box>
				<Box paddingTop={2}>
					{activeSection === Section.Responses && (
						<>
							{responses.map(p => (
								<FeedPost
									hideParent
									key={p?._id}
									post={p}
									topResponse={lv2Responses.find(r => p._id === r.parent)}
								/>
							))}
							{!responses.length && 'No Responses'}
						</>
					)}
					{activeSection === Section.Reposts && (
						<>
							{attachedToPosts.map(p => (
								<FeedPost
									hideParent
									key={p?._id}
									post={p as any}
								/>
							))}
							{!attachedToPosts.length && 'No reposts'}
						</>
					)}
				</Box>
			</ScrollContent>
		</>
	);
};

export default PostPage;

interface Params extends ParsedUrlQuery {
	id?: string;
}

export
const getServerSideProps: GetServerSideProps<Props, Params> = async (ctx) => {
	const { params: { id = '' } = {} } = ctx;
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	return {
		props: {
			session,
			data: await fetchFocusedPost(userId, id),
		},
	};
};
