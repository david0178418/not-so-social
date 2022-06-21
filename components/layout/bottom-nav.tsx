import { useState } from 'react';
import { ModalActions, Paths } from '@common/constants';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
	BottomNavigation,
	BottomNavigationAction,
	Fab,
	Paper,
} from '@mui/material';
import {
	BookmarkActiveIcon,
	BookmarkIcon,
	CreateIcon,
	HomeActiveIcon,
	HomeIcon,
	LoginIcon,
	ProfileActiveIcon,
	ProfileIcon,
} from '@components/icons';
import Link from 'next/link';

export
function BottomNav() {
	const router = useRouter();
	const { data } = useSession();
	const [value, setValue] = useState(0);
	const user = data?.user;
	const {
		pathname,
		query,
	} = router;

	return (
		<Paper
			elevation={3}
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				display: {
					xs: 'inline',
					sm: 'none',
				},
			}}
		>
			{!!user && (
				<Fab
					color="primary"
					sx={{
						position: 'absolute',
						top: -64,
						right: 16,
					}}
				>
					<CreateIcon/>
				</Fab>
			)}
			<BottomNavigation
				showLabels
				value={value}
				onChange={(event, newValue) => setValue(newValue)}
			>
				<Link
					shallow
					passHref
					href={Paths.Home}
				>
					<BottomNavigationAction
						label="Home"
						icon={
							Paths.Home === pathname ?
								<HomeActiveIcon /> :
								<HomeIcon />
						}
					/>
				</Link>
				<Link
					shallow
					passHref
					href={{
						pathname,
						query: {
							a: ModalActions.LoginRegister,
							...query,
						},
					}}
				>
					<BottomNavigationAction
						label="Login"
						icon={<LoginIcon />}
					/>
				</Link>
				{!!user && (
					<>
						<BottomNavigationAction
							label="Bookmarks"
							icon={
								Paths.Bookmarks === pathname ?
									<BookmarkActiveIcon /> :
									<BookmarkIcon />
							}
						/>
						<BottomNavigationAction
							label={user.username}
							icon={
								Paths.Profile === pathname ?
									<ProfileActiveIcon /> :
									<ProfileIcon />
							}
						/>
					</>
				)}
			</BottomNavigation>
		</Paper>
	);
}
