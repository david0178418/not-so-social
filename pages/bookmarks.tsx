import type { Feed } from '@common/types';

import Head from 'next/head';
import { FeedPost } from '@components/feed-post';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';
import { ScrollContent } from '@components/scroll-content';
import { fetchBookmarkedPosts } from '@common/server/queries';
import { LoadMoreButton } from '@components/load-more-button';
import { useEffect, useState } from 'react';
import { getFeed } from '@common/client/api-calls';
import {
	AppName,
	FeedTypes,
	MaxSearchTermSize,
	PageSize,
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
	const [feed, setFeed] = useState<Feed>(initialFeed);
	const [isDone, setIsDone] = useState(false);
	const {
		parentPostMap,
		posts,
		responsePostMap,
	} = feed;

	useEffect(() => {
		if(feed === initialFeed) {
			return;
		}

		setFeed(initialFeed);
		setIsDone(false);
	}, [initialFeed]);

	async function loadMore() {
		const { data }: any = await getFeed(FeedTypes.Bookmarks, {
			fromIndex: feed.posts.length,
			searchTerm,
		});

		if(data?.feed) {
			setFeed({
				posts: [
					...feed.posts,
					...data.feed.posts,
				],
				parentPostMap: {
					...feed.parentPostMap,
					...data.feed.parentPostMap,
				},
				responsePostMap: {
					...feed.responsePostMap,
					...data.feed.responsePostMap,
				},
			});
		}

		if(!data.feed?.posts || data.feed.posts.length < PageSize) {
			return true;
		}

		return false;
	}

	return (
		<>
			<Head>
				<title>{AppName}</title>
				<meta name="description" content={`${AppName} - Bookmarks`} />
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
						<SearchForm
							searchPath={Paths.Bookmarks}
							placeholder="Search Bookmarks"
							value={searchTerm}
						/>
					</Box>
				}
			>
				{searchTerm && (
					<Typography>
						{posts.length ?
							`Search Results for "${searchTerm}"` :
							`No Results for "${searchTerm}"`
						}
					</Typography>
				)}
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
				<LoadMoreButton
					onMore={loadMore}
					isDone={isDone}
					onDone={() => setIsDone(true)}
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
