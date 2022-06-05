import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Head from 'next/head';
import { Layout } from '@components/layout';
import { Post } from '@common/types';
import { getPost } from '@common/server/db-calls';
import { IconButton, Typography } from '@mui/material';
import { formatDate } from '@common/utils';
import { BackIcon } from '@components/icons';
import Link from 'next/link';
import { getSession } from 'next-auth/react';

interface Props {
	post: Post | null;
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

	return { props: { post: await getPost(userId, id) } };
};

const Home: NextPage<Props> = (props) => {
	const { post } = props;

	return (
		<Layout>
			<>
				<Head>
					<title>Pinboard - </title>
				</Head>
				<main>
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
				</main>
			</>
		</Layout>
	);
};

export default Home;
