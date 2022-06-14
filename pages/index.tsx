import type { GetServerSideProps, NextPage } from 'next';

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
	const userId = session?.user.id || '';
	return { props: { posts: await getPosts(userId || '') } };
};

const Home: NextPage<Props> = (props) => {
	const { posts } = props;

	return (
		<>
			<Head>
				<title>Pinboard</title>
				<meta name="description" content="Pinboard" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Layout>
				<div className="baz">
					<div className="foo" >
						asdfasdf
					</div>
					<div className="bar">
						{posts.map(p => (
							<FeedPost
								key={p._id}
								post={p}
							/>
						))}
					</div>
				</div>
				<style jsx>{`
					.baz {
						display: flex;
						flex-direction: column;
						max-height: 100%;
					}

					.foo {
						color: red;
						height: 100px;
						background-color: #FFFFFFCC;
					}

					.bar {
						overflow: hidden scroll;
						flex: 1;
					}
				`}</style>
			</Layout>
		</>
	);
};

export default Home;
