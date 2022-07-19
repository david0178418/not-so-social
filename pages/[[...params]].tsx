import type { GetServerSideProps, NextPage } from 'next';
import type { Feed } from '@common/types';

import { ScrollContent } from '@components/scroll-content';
import { FeedPost } from '@components/feed-post';
import { getServerSession } from '@common/server/auth-options';
import { HomeSortTabs } from '@components/home-sort-tabs';
import { SearchForm } from '@components/search-form';
import { NextSeo } from 'next-seo';
import { Box } from '@mui/material';
import { LoadMoreButton } from '@components/load-more-button';
import { FeedTypeQueryMap } from '@common/server/queries';
import { ReactNode } from 'react';
import { useFeed } from '@common/hooks';
import {
	AppName,
	BaseUrl,
	FeedTypes,
	Paths,
} from '@common/constants';

// TODO Clean all this up
type HomeFeedTypes = FeedTypes.Hot | FeedTypes.New | FeedTypes.Top;

interface Props {
	children?: ReactNode;
	feedType: string;
	feed: Feed;
}

const HomePage: NextPage<Props> = (props) => {
	const { feed: initialFeed } = props;
	const [feed, isDone, loadMore] = useFeed(initialFeed);
	const {
		parentPostMap,
		posts,
		responsePostMap,
	} = feed;

	function handleLoadMore() {
		return loadMore(FeedTypes.Hot, { afterTimeISO: feed.cutoffISO });
	}

	return (
		<>
			<NextSeo
				title={AppName}
				description={AppName}
				openGraph={{
					url: BaseUrl,
					title: AppName,
					description: AppName,
					site_name: AppName,
				}}
			/>
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
				{posts.map((p, i) => (
					<FeedPost
						key={`${p._id}+${i}`}
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
				<LoadMoreButton
					onMore={handleLoadMore}
					isDone={isDone}
				/>
			</ScrollContent>
		</>
	);
};

export default HomePage;

const ValidFeedTypes = [
	FeedTypes.Hot,
	FeedTypes.New,
	FeedTypes.Top,
];

export
const getServerSideProps: GetServerSideProps<Props, any> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	const { params = [FeedTypes.Hot] } = ctx.params;

	// Compensate for some weird vercel behavior where "index" is being
	// passed as the path parameter rather than nothing, as expected.
	const feedType: HomeFeedTypes = (params[0] === 'index') ? FeedTypes.Hot : params[0];

	if(!ValidFeedTypes.includes(feedType)) {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Home,
			},
		};
	}

	const feed = await FeedTypeQueryMap[feedType]({ userId });

	return {
		props: {
			session,
			feedType,
			feed,
		},
	};
};
