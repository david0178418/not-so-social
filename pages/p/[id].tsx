import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { Layout } from '@components/layout';
import { getFocusedPost } from '@common/server/db-calls';
import { formatDate } from '@common/utils';
import { BackIcon } from '@components/icons';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { FeedPost } from '@components/feed-post';
import {
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

	return { props: { data: await getFocusedPost(userId, id) } };
};

const Home: NextPage<Props> = (props) => {
	const {
		data: {
			parentPost,
			post,
			responses,
		},
	} = props;

	return (
		<Layout>
			<Head>
				<title>Pinboard - </title>
			</Head>
			<main>
				{parentPost && (
					<FeedPost post={parentPost} />
				)}
				{!post && (
					<Typography variant="body1">
						<Link href="/">
							<a>
								<IconButton color="primary">
									<BackIcon />
								</IconButton>&nbsp;
							</a>
						</Link>
						This post doesn&apos;t exist
					</Typography>
				)}
				{post && (
					<>
						<Typography variant="h4" component="div" gutterBottom>
							<Link href="/">
								<a>
									<IconButton color="primary">
										<BackIcon />
									</IconButton>&nbsp;
								</a>
							</Link>
							{post.title}
						</Typography>
						{(post.created !== post.lastUpdated) && (
							<>
								<Typography variant="subtitle1" component="em" gutterBottom>
									Last Updated: {formatDate(post.lastUpdated)}
								</Typography>
								<br/>
							</>
						)}
						<Typography variant="subtitle1" component="em" gutterBottom>
							Created: {formatDate(post.created)}
						</Typography>
						<Typography variant="body1" gutterBottom>
							{post.body}
						</Typography>
					</>
				)}
				{responses.map(p => (
					<FeedPost
						key={p._id}
						post={p}
					/>
				))}
			</main>
		</Layout>
	);
};

export default Home;
