import { AsyncFnReturnType } from '@common/types';
import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { Box, Typography } from '@mui/material';
import { SearchForm } from '@components/search-form';
import { NextSeo } from 'next-seo';
import { fetchSearchFeed } from '@common/server/queries/feed/search';
import {
	AppName,
	BaseUrl,
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
	const feed = await fetchSearchFeed(session?.user.id, searchTerm);

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
		feed: {
			parentPostMap,
			posts,
			responsePostMap,
		},
	} = props;

	const title = `${AppName} - Search Results`;
	const description = `"${searchTerm}" Search Results - ${AppName}`;

	return (
		<>
			<NextSeo
				title={title}
				description={description}
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
