import Head from 'next/head';
import { fetchFeed } from '@common/server/queries/feed';
import { AsyncFnReturnType } from '@common/types';
import { FeedPost } from '@components/feed-post';
import { SearchIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { AppName, Paths } from '@common/constants';
import {
	Box,
	InputAdornment,
	TextField,
} from '@mui/material';

export
const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);

	if(!session) {
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
			data: await fetchFeed('bookmarks', session.user.id),
			// posts: userId ?
			// 	await fetchUserBookmarkedPosts(userId) :
			// 	[],
		},
	};
};

interface Props {
	data: AsyncFnReturnType<typeof fetchFeed>;
}

const BookmarksPage: NextPage<Props> = (props) => {
	const {
		data: {
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
						<TextField
							fullWidth
							placeholder="Search Bookmarks"
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

export default BookmarksPage;
