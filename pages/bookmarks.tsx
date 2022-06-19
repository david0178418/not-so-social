import { Box, Typography } from '@mui/material';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

export
const getServerSideProps: GetServerSideProps = async (ctx) => {
	return { props: { session: await getSession(ctx) } };
};

const BookmarksPage: NextPage<any> = () => {

	return (
		<Box>
			<Typography>
				Bookmarks...
			</Typography>
		</Box>
	);
};

export default BookmarksPage;
