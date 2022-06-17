import type { GetServerSideProps, NextPage } from 'next';
import type { Post, PostIdMap } from '@common/types';

import Head from 'next/head';
import { Layout } from '@components/layout';
import { getFeedPosts } from '@common/server/db-calls';
import { FeedPost } from '@components/feed-post';
import { getSession } from 'next-auth/react';
import { SearchIcon } from '@components/icons';
import {
	Box,
	InputAdornment,
	TextField,
} from '@mui/material';

interface Props {
	parentPosts: PostIdMap;
	posts: Post[];
}

export
const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
	const session = await getSession({ req });
	const userId = session?.user.id || '';
	return { props: await getFeedPosts(userId || '') };
};

const Home: NextPage<Props> = (props) => {
	const {
		parentPosts,
		posts,
	} = props;
	console.log(parentPosts);
	return (
		<>
			<Head>
				<title>Pinboard</title>
				<meta name="description" content="Pinboard" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Layout>
				<div className="baz">
					<Box sx={{
						paddingTop: 1,
						paddingBottom: 2,
						paddingLeft: {
							xs: 2,
							sm: 10,
							md: 15,
							lg: 20,
						},
						paddingRight: {
							xs: 2,
							sm: 10,
							md: 15,
							lg: 20,
						},
					}}>
						<TextField
							fullWidth
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</Box>
					<div className="bar">
						{posts.map(p => (
							<FeedPost
								parentPost={parentPosts[p.parentId || '']}
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
						padding-top: 10px;
						padding-right: 100px;
						padding-bottom: 20px;
						padding-left: 100px;
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
