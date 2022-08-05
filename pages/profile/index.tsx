import type { GetServerSideProps, NextPage } from 'next';

import Link from 'next/link';
import { ModalActions, Paths } from '@common/constants';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession } from '@common/server/auth-options';
import { Box, Button } from '@mui/material';
import { PasswordChangeForm } from '@components/password-change-form';

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
		<Box padding={2}>
			Signed in as {session.data?.user.username}
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
			<Box paddingY={2}>
				<Link
					shallow
					passHref
					href={Paths.ProfilePosts}
				>
					<Button>
						My Posts
					</Button>
				</Link>
			</Box>
			<PasswordChangeForm />
		</Box>
	);
};

export default ProfilePage;


