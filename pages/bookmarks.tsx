import Head from 'next/head';
import { fetchFeed } from '@common/server/queries/feed';
import { AsyncFnReturnType } from '@common/types';
import { FeedPost } from '@components/feed-post';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';
import { ScrollContent } from '@components/scroll-content';
import {
	AppName,
	FeedTypes,
	MaxSearchTermSize,
	Paths,
} from '@common/constants';

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

	const feed = await fetchFeed(FeedTypes.Bookmarks, session.user.id, searchTerm);

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

interface Props {
	feed: AsyncFnReturnType<typeof fetchFeed>;
	searchTerm: string;
}

const BookmarksPage: NextPage<Props> = (props) => {
	const {
		searchTerm,
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
			</ScrollContent>
		</>
	);
};

export default BookmarksPage;
