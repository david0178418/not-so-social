import type { Feed } from '@common/types';
import type { GetServerSideProps, NextPage } from 'next';

import Head from 'next/head';
import { FeedPost } from '@components/feed-post';
import { getServerSession } from '@server/auth-options';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';
import { ScrollContent } from '@components/scroll-content';
import { fetchBookmarkedPosts } from '@server/queries';
import { LoadMoreButton } from '@components/load-more-button';
import { useFeed } from '@common/hooks';
import {
	AppName,
	FeedTypes,
	MaxSearchTermSize,
	Paths,
} from '@common/constants';

interface Props {
	feed: Feed;
	searchTerm: string;
}

const BookmarksPage: NextPage<Props> = (props) => {
	const {
		searchTerm,
		feed: initialFeed,
	} = props;
	const [feed, isDone, loadMore] = useFeed(initialFeed);
	const {
		posts,
		responsePostMap,
	} = feed;

	function handleLoadMore() {
		return loadMore(FeedTypes.Bookmarks, {
			fromIndex: feed.posts.length,
			searchTerm,
		});
	}

	return (
		<>
			<Head>
				<title>{AppName} - Bookmarks</title>
				<meta name="description" content={`${AppName} - Bookmarks`} />
			</Head>
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
							searchPath={Paths.Bookmarks}
							placeholder="Search Bookmarks"
							value={searchTerm}
						/>
						{searchTerm && (
							<Box paddingTop={1}>
								<Typography>
									{posts.length ?
										`Search Results for "${searchTerm}"` :
										`No Results for "${searchTerm}"`
									}
								</Typography>
							</Box>
						)}
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

export default BookmarksPage;

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);

	if(!session) {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Bookmarks,
			},
		};
	}

	const rawTerm = ctx.query?.q || '';
	const foo = Array.isArray(rawTerm) ?
		rawTerm.join() :
		rawTerm;
	const searchTerm = foo.substring(0, MaxSearchTermSize);

	const feed = await fetchBookmarkedPosts({
		userId: session.user.id,
		searchTerm,
	});

	return {
		props: {
			session,
			feed,
			searchTerm,
			// posts: userId ?
			// 	await fetchUserBookmarkedPosts(userId) :
			// 	[],
		},
	};
};
