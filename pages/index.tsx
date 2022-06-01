import type { GetServerSideProps, NextPage } from 'next';

import { Layout } from '@components/layout';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import { Post } from '@common/types';
import { getPosts } from '@common/server/db-calls';
import { FeedPost } from '@components/feed-post';
import { List } from '@mui/material';

export
const getServerSideProps: GetServerSideProps<Props> = async () => {
	const posts = await getPosts();
	console.log(posts);
	return { props: { posts } };
};

interface Props {
	posts: Post[];
}

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
					<List>
						{posts.map(p => (
							<FeedPost
								key={p._id}
								post={p}
							/>
						))}
					</List>
				</main>
			</div>
		</Layout>
	);
};

export default Home;
