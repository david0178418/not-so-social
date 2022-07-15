import Head from 'next/head';
import { AsyncFnReturnType } from '@common/types';
import { FeedPost } from '@components/feed-post';
import { SearchIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { AppName, Paths } from '@common/constants';
import { fetchSearchFeed } from '@common/server/queries/search';
import Joi from 'joi';
import {
	Box,
	InputAdornment,
	TextField,
} from '@mui/material';


interface Schema {
	q: string;
}

const schema = Joi.object<Schema>({
	q: Joi
		.string()
		.min(3)
		.max(100)
		.required(),
});

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	try {
		const { q: searchTerm } = await schema.validateAsync(ctx.query);

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
						<TextField
							fullWidth
							placeholder={`Search ${AppName}`}
							defaultValue={searchTerm}
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
