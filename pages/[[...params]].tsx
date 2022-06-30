import type { GetServerSideProps, NextPage } from 'next';
import type { AsyncFnReturnType } from '@common/types';
import type { ReactNode } from 'react';

import Head from 'next/head';
import { fetchFeed } from '@common/server/queries/feed';
import { SearchIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { FeedPost } from '@components/feed-post';
import { getServerSession } from '@common/server/auth-options';
import { AppName } from '@common/constants';
import { HomeSortTabs } from '@components/home-sort-tabs';
import { subDays } from 'date-fns';
import {
	Box,
	InputAdornment,
	TextField,
} from '@mui/material';

interface Props {
	children?: ReactNode;
	data: AsyncFnReturnType<typeof fetchFeed>;
}

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	return {
		props: {
			session,
			data: await fetchFeed('top', userId || '', subDays(new Date(), 4).toISOString()),
		},
	};
};

const HomePage: NextPage<Props> = (props) => {
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
				<title>{AppName}</title>
				<meta name="description" content={AppName} />
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
							placeholder={`Search ${AppName}`}
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
				<HomeSortTabs />
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

export default HomePage;
