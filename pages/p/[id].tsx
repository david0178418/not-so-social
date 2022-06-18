import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { getFocusedPost } from '@common/server/db-calls';
import { BackIcon } from '@components/icons';
import { getSession } from 'next-auth/react';
import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { useRouteBackDefault } from '@common/hooks';
import {
	Box,
	IconButton,
	Typography,
} from '@mui/material';

interface Props {
	data: AsyncFnReturnType<typeof getFocusedPost>;
}

interface Params extends ParsedUrlQuery {
	id?: string;
}

export
const getServerSideProps: GetServerSideProps<Props, Params> = async (ctx) => {
	const {
		req,
		params: { id = '' } = {},
	} = ctx;
	const session = await getSession({ req });
	const userId = session?.user.id || '';

	return {
		props: {
			session,
			data: await getFocusedPost(userId, id),
		},
	};
};

const Home: NextPage<Props> = (props) => {
	const routeBack = useRouteBackDefault();
	const {
		data: {
			parentPost,
			post,
			responses,
		},
	} = props;

	return (
		<>
			<Head>
				<title>Pinboard - </title>
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
							</IconButton>&nbsp;
							Post
						</Typography>
					</Box>
				}
			>
				{post && (
					<FeedPost
						post={post}
						parentPosts={parentPost ? [parentPost] : []}
						responses={responses}
					/>
				)}
			</ScrollContent>
		</>
	);
};

export default Home;
