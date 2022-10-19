import type { GetServerSideProps, NextPage } from 'next';
import type { AsyncFnReturnType } from '@common/types';

import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { getServerSession } from '@server/auth-options';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';
import { NextSeo } from 'next-seo';
import { fetchSearchFeed } from '@server/queries';
import { LoadMoreButton } from '@components/load-more-button';
import { useFeed } from '@common/hooks';
import {
	AppName,
	BaseUrl,
	FeedTypes,
	MaxSearchTermSize,
	Paths,
} from '@common/constants';

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const rawTerm = ctx.query?.q || '';
	const foo = Array.isArray(rawTerm) ?
		rawTerm.join() :
		rawTerm;
	const searchTerm = foo.substring(0, MaxSearchTermSize);

	if(!searchTerm) {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Home,
			},
		};
	}

	const session = await getServerSession(ctx.req, ctx.res);
	const feed = await fetchSearchFeed({
		userId: session?.user.id,
		searchTerm,
	});

	return {
		props: {
			session,
			searchTerm,
			feed,
		},
	};
};

interface Props {
	searchTerm: string;
	feed: AsyncFnReturnType<typeof fetchSearchFeed>;
}

const SearchPage: NextPage<Props> = (props) => {
	const {
		searchTerm,
		feed: initialFeed,
	} = props;
	const [feed, isDone, loadMore] = useFeed(initialFeed);
	const {
		posts,
		responsePostMap,
	} = feed;

	const title = `${AppName} - Search Results`;
	const description = `"${searchTerm}" Search Results - ${AppName}`;

	function handleLoadMore() {
		return loadMore(FeedTypes.Search, {
			fromIndex: feed.posts.length,
			searchTerm,
		});
	}

	return (
		<>
			<NextSeo
				title={title}
				description={description}
				twitter={{
					site: '@NotSoSocialApp',
					cardType: 'summary_large_image',
				}}
				openGraph={{
					url: `${BaseUrl}${Paths.Search}?q=${searchTerm}`,
					title: title,
					description: description,
					site_name: AppName,
				}}
			/>
			<ScrollContent
				header={
					<Box sx={{
						paddingTop: 1,
						paddingBottom: 1,
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
						<SearchForm
							placeholder={`Search ${AppName}`}
							value={searchTerm}
						/>
						<Box paddingTop={1}>
							<Typography>
								{posts.length ?
									`Search Results for "${searchTerm}"` :
									`No Results for "${searchTerm}"`
								}
							</Typography>
						</Box>
					</Box>
				}
			>
				{posts.map(p => (
					<FeedPost
						key={p._id}
						post={p}
						topResponse={responsePostMap[p._id || '']}
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

export default SearchPage;
