import Link from 'next/link';
import { ModalActions, Paths } from '@common/constants';
import { Box, Button } from '@mui/material';
import { GetServerSideProps, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession } from '@common/server/auth-options';

export
const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res);

	if(!session) {
		return {
			redirect: {
				permanent: false,
				destination: Paths.Home,
			},
		};
	}

	return { props: { session } };
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
