import Head from 'next/head';
import { AsyncFnReturnType } from '@common/types';
import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { AppName, Paths } from '@common/constants';
import { fetchSearchFeed } from '@common/server/queries/search';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';

const MaxSearchTermSize = 100;

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	try {
		const rawTerm = ctx.query?.q || '';
		const foo = Array.isArray(rawTerm) ?
			rawTerm.join() :
			rawTerm;
		const searchTerm = foo.substring(0, MaxSearchTermSize);

		const session = await getServerSession(ctx.req, ctx.res);
		const userId = session?.user.id || '';
		const feed = await fetchSearchFeed(searchTerm, userId);

		return {
			props: {
				session,
				searchTerm,
				feed,
			},
		};
	} catch {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Home,
			},
		};
	}
};

interface Props {
	searchTerm: string;
	feed: AsyncFnReturnType<typeof fetchSearchFeed>;
}

const SearchPage: NextPage<Props> = (props) => {
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
				<title>{AppName} - Search Results</title>
				<meta name="description" content={`${AppName} - Search Results for "${searchTerm}"`} />
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
							placeholder={`Search ${AppName}`}
							value={searchTerm}
						/>
					</Box>
				}
			>
				<Typography>
					{posts.length ?
						`Search Results for "${searchTerm}"` :
						`No Results for "${searchTerm}"`
					}
				</Typography>
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

export default SearchPage;
