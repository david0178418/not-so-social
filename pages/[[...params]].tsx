import type { GetServerSideProps, NextPage } from 'next';
import type { AsyncFnReturnType } from '@common/types';
import { ReactNode, useState } from 'react';

import { ScrollContent } from '@components/scroll-content';
import { FeedPost } from '@components/feed-post';
import { getServerSession } from '@common/server/auth-options';
import { HomeSortTabs } from '@components/home-sort-tabs';
import { SearchForm } from '@components/search-form';
import { NextSeo } from 'next-seo';
import { useInView } from 'react-cool-inview';
import {
	Box,
	Button,
	CircularProgress,
} from '@mui/material';
import {
	AppName,
	BaseUrl,
	FeedTypes,
	Paths,
} from '@common/constants';
import {
	fetchHotPosts,
	fetchNewPosts,
	fetchTopPosts,
} from '@common/server/queries';

type Foo = FeedTypes.Hot | FeedTypes.New | FeedTypes.Top;
type Bar = typeof fetchHotPosts | typeof fetchNewPosts | typeof fetchTopPosts;

interface Props {
	children?: ReactNode;
	feedType: string;
	feed: AsyncFnReturnType<Bar>;
}

const ValidFeedTypes = [
	FeedTypes.Hot,
	FeedTypes.New,
	FeedTypes.Top,
];

const FeedQueries = {
	[FeedTypes.Hot]: fetchHotPosts,
	[FeedTypes.New]: fetchNewPosts,
	[FeedTypes.Top]: fetchTopPosts,
};

export
const getServerSideProps: GetServerSideProps<Props, any> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	const { params = [FeedTypes.Hot] } = ctx.params;

	// Compensate for some weird vercel behavior where "index" is being
	// passed as the path parameter rather than nothing, as expected.
	const feedType: Foo = (params[0] === 'index') ? FeedTypes.Hot : params[0];

	if(!ValidFeedTypes.includes(feedType)) {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Home,
			},
		};
	}

	return {
		props: {
			session,
			feedType,
			feed: await FeedQueries[feedType](userId),
		},
	};
};

const HomePage: NextPage<Props> = (props) => {
	const [isLoading, setIsLoading] = useState(true);
	const { observe } = useInView({ onEnter: loadMore });
	const {
		feed: {
			parentPostMap,
			posts,
			responsePostMap,
		},
	} = props;

	async function loadMore() {
		setIsLoading(true);
		setIsLoading(false);
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
				<Box paddingTop={5} paddingBottom={8}>
					<Button
						fullWidth
						ref={observe}
						disabled={isLoading}
						endIcon={
							isLoading ?
								<CircularProgress color="inherit" /> :
								null
						}
					>
						{isLoading ?
							'Loading' :
							'Load More'
						}
					</Button>
				</Box>
			</ScrollContent>
		</>
	);
};

export default HomePage;
