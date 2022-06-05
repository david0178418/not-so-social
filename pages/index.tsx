import type { GetServerSideProps, NextPage } from 'next';

import styles from '@/styles/Home.module.css';

import Head from 'next/head';
import { Layout } from '@components/layout';
import { Post } from '@common/types';
import { getPosts } from '@common/server/db-calls';
import { FeedPost } from '@components/feed-post';
import { getSession } from 'next-auth/react';

interface Props {
	posts: Post[];
}

export
const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
	const session = await getSession({ req });
	console.log(111, session);
	const userId = session?.user.id || '';
	return { props: { posts: await getPosts(userId || '') } };
};

const Home: NextPage<Props> = (props) => {
	const { posts } = props;

	return (
		<Layout>
			<div className={styles.container}>
				<Head>
					<title>Pinboard</title>
					<meta name="description" content="Pinboard" />
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<main className={styles.main}>
					<div>
						{posts.map(p => (
							<FeedPost
								key={p._id}
								post={p}
							/>
						))}
					</div>
				</main>
			</div>
		</Layout>
	);
};

export default Home;
