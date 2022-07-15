import type { GetServerSideProps, NextPage } from 'next';
import type { AsyncFnReturnType } from '@common/types';
import { ReactNode } from 'react';

import Head from 'next/head';
import { fetchFeed } from '@common/server/queries/feed';
import { ScrollContent } from '@components/scroll-content';
import { FeedPost } from '@components/feed-post';
import { getServerSession } from '@common/server/auth-options';
import { AppName } from '@common/constants';
import { HomeSortTabs } from '@components/home-sort-tabs';
import { subDays } from 'date-fns';
import { Box } from '@mui/material';
import { SearchForm } from '@components/search-form';

interface Props {
	children?: ReactNode;
	feedType: string;
	feed: AsyncFnReturnType<typeof fetchFeed>;
}

const ValidFeedTypes = ['hot', 'new', 'top'];

export
const getServerSideProps: GetServerSideProps<Props, any> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	const { params = ['hot'] } = ctx.params;
	const feedType = ValidFeedTypes.includes(params[0]) ? params[0] : 'hot';

	return {
		props: {
			session,
			feedType,
			feed: await fetchFeed(feedType, userId || '', subDays(new Date(), 7).toISOString()),
		},
	};
};

const HomePage: NextPage<Props> = (props) => {
	const {
		feed: {
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
						<SearchForm />
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
