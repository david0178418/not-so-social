import type { GetServerSideProps, NextPage } from 'next';
import type { AsyncFnReturnType } from '@common/types';
import type { ReactNode } from 'react';

import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { getFeedPosts } from '@common/server/db-calls';
import { SearchIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { FeedPost } from '@components/feed-post';
import {
	Box,
	InputAdornment,
	TextField,
} from '@mui/material';

interface Props {
	children?: ReactNode;
	data: AsyncFnReturnType<typeof getFeedPosts>;
}

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const session = await getSession(ctx);
	const userId = session?.user.id || '';

	return {
		props: {
			session,
			data: await getFeedPosts(userId || ''),
		},
	};
};

const Home: NextPage<Props> = (props) => {
	const {
		data: {
			parentPostMap,
			posts,
			responsePostMap,
		},
	} = props;

	return (
		<>
			<Head>
				<title>Pinboard</title>
				<meta name="description" content="Pinboard" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<ScrollContent
				header={
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
				}
			>
				{posts.map(p => (
					<FeedPost
						key={p._id}
						post={p}
						parentPosts={
							(p.parentId && parentPostMap[p.parentId]) ?
								[parentPostMap[p.parentId]] :
								[]
						}
						responses={
							(p._id && responsePostMap[p._id]) ?
								[responsePostMap[p._id]] :
								[]
						}
					/>
				))}
			</ScrollContent>
		</>
	);
};

export default Home;
