import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { BackIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { useRouteBackDefault } from '@common/hooks';
import { getServerSession } from '@common/server/auth-options';
import { fetchPost, fetchPostTransactions } from '@common/server/queries';
import { formatDate } from '@common/utils';
import {
	AppName,
	Paths,
	SpecialCharacterCodes,
} from '@common/constants';
import {
	Box,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';

interface Props {
	post: AsyncFnReturnType<typeof fetchPost>;
	transactions: AsyncFnReturnType<typeof fetchPostTransactions>;
}

interface Params extends ParsedUrlQuery {
	id?: string;
}

export
const getServerSideProps: GetServerSideProps<Props, Params> = async (ctx) => {
	const { params: { id = '' } = {} } = ctx;
	const session = await getServerSession(ctx.req, ctx.res);
	const userId = session?.user.id || '';

	const [
		post,
		transactions,
	] = await Promise.all([
		fetchPost(id, userId),
		fetchPostTransactions(id),
	]);

	return {
		props: {
			session,
			post,
			transactions,
		},
	};
};

const PostPointsPage: NextPage<Props> = (props) => {
	const {
		post,
		transactions,
	} = props;
	const routeBack = useRouteBackDefault(`${Paths.Post}/${post?._id}`);

	return (
		<>
			<Head>
				<title>{AppName} - Points History</title>
			</Head>
			<ScrollContent
				header={
					<Box sx={{
						paddingTop: 1,
						paddingBottom: 2,
						display: 'flex',
					}}>
						<IconButton color="primary" onClick={routeBack}>
							<BackIcon />
						</IconButton>{SpecialCharacterCodes.NBSP}
						<Typography
							variant="h5"
							gutterBottom
							sx={{
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								textOverflow: 'ellipsis',
							}}
						>
							{post?.title}
						</Typography>
					</Box>
				}
			>
				<List>
					{transactions.map(t => (
						<ListItem key={t._id}>
							<ListItemText
								primary={`${t.points.toLocaleString()}pts`}
								secondary={formatDate(t.date)}
							/>
						</ListItem>
					))}
				</List>
			</ScrollContent>
		</>
	);
};

export default PostPointsPage;
