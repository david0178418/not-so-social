import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { fetchFocusedPost } from '@common/server/queries';
import { BackIcon } from '@components/icons';
import { FeedPost } from '@components/feed-post';
import { ScrollContent } from '@components/scroll-content';
import { useRouteBackDefault } from '@common/hooks';
import { getServerSession } from '@common/server/auth-options';
import { NextSeo } from 'next-seo';
import {
	AppName,
	BaseUrl,
	Paths,
	SpecialCharacterCodes,
} from '@common/constants';
import {
	Box,
	IconButton,
	Typography,
} from '@mui/material';

interface Props {
	data: AsyncFnReturnType<typeof fetchFocusedPost>;
}

interface Params extends ParsedUrlQuery {
	id?: string;
}

export
const getServerSideProps: GetServerSideProps<Props, Params> = async (ctx) => {
	const { params: { id = '' } = {} } = ctx;
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	return {
		props: {
			session,
			data: await fetchFocusedPost(userId, id),
		},
	};
};

const PostPage: NextPage<Props> = (props) => {
	const routeBack = useRouteBackDefault();
	const {
		data: {
			parentPost,
			post,
			responses,
		},
	} = props;

	const {
		title = '',
		description = '',
	} = post ? {
		title: `"${post.title}" - ${AppName}`,
		description: `${post.body}`,
	} : {};

	return (
		<>
			<NextSeo
				title={title}
				description={description}
				openGraph={{
					url: `${BaseUrl}${Paths.Post}/${post?._id}`,
					title,
					description,
					site_name: AppName,
				}}
			/>
			<Head>
				<title>{AppName}</title>
			</Head>
			<ScrollContent
				header={
					<Box sx={{
						paddingTop: 1,
						paddingBottom: 2,
					}}>
						<Typography variant="h5" component="div" gutterBottom>
							{/** TODO Capture direct links and send them to home page */}
							<IconButton color="primary" onClick={routeBack}>
								<BackIcon />
							</IconButton>{SpecialCharacterCodes.NBSP}
							Post
						</Typography>
					</Box>
				}
			>
				{post && (
					<FeedPost
						post={post}
						parentPosts={parentPost ? [parentPost] : []}
						responses={responses}
					/>
				)}
			</ScrollContent>
		</>
	);
};

export default PostPage;
