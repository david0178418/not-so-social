import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { Box, Button } from '@mui/material';
import { GetServerSideProps, NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export
const getServerSideProps: GetServerSideProps = async (ctx) => {
	return { props: { session: await getSession(ctx) } };
};

const ProfilePage: NextPage<any> = () => {
	const router = useRouter();
	const session = useSession();
	const {
		pathname,
		query,
	} = router;

	return (
		<Box>
			Signed in as {session.data?.user.username}

			<div>

				<Link
					shallow
					passHref
					href={{
						pathname,
						query: {
							a: ModalActions.Logout,
							...query,
						},
					}}
				>
					<Button>
						Logout
					</Button>
				</Link>
			</div>
		</Box>
	);
};

export default ProfilePage;
