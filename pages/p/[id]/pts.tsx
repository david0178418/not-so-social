import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { AsyncFnReturnType } from '@common/types';

import Head from 'next/head';
import { BackIcon } from '@components/icons';
import { ScrollContent } from '@components/scroll-content';
import { useRouteBackDefault } from '@common/hooks';
import { getServerSession } from '@common/server/auth-options';
import { AppName, UnicodeChars } from '@common/constants';
import { fetchPost, fetchPostTransactions } from '@common/server/db-calls';
import {
	Box,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';
import { formatCompactNumber, formatDate } from '@common/utils';

interface Props {
	data: {
		post: AsyncFnReturnType<typeof fetchPost>;
		transactions: AsyncFnReturnType<typeof fetchPostTransactions>;
	};
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
	] = await  Promise.all([
		fetchPost(id, userId),
		fetchPostTransactions(id),
	]);

	console.log('post', {
		post,
		transactions,
	});

	return {
		props: {
			session,
			data: {
				post,
				transactions,
			},
		},
	};
};

const PostPointsPage: NextPage<Props> = (props) => {
	const routeBack = useRouteBackDefault();
	const {
		data: {
			post,
			transactions,
		},
	} = props;

	console.log(transactions);

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
						</IconButton>{UnicodeChars.NBSP}
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
								primary={`${t.appliedPoints.toLocaleString()}pts`}
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
