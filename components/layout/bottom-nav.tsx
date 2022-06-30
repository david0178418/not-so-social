import { useState } from 'react';
import { ModalActions, Paths } from '@common/constants';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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

export
function BottomNav() {
	const router = useRouter();
	const { data } = useSession();
	const [value, setValue] = useState(0);
	const user = data?.user;
	const {
		asPath,
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
							['/', '/top', '/new'].includes(asPath) ?
								<HomeActiveIcon /> :
								<HomeIcon />
						}
					/>
				</Link>
				{!user && (
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
				)}
				{!!user && (
					[
						<Link
							key="a"
							shallow
							passHref
							href={Paths.Bookmarks}
						>
							<BottomNavigationAction
								key="a"
								label="Bookmarks"
								icon={
									Paths.Bookmarks === asPath ?
										<BookmarkActiveIcon /> :
										<BookmarkIcon />
								}
							/>
						</Link>,
						<Link
							key="b"
							shallow
							passHref
							href={Paths.Profile}
						>
							<BottomNavigationAction
								label={user.username}
								icon={
									Paths.Profile === asPath ?
										<ProfileActiveIcon /> :
										<ProfileIcon />
								}
							/>
						</Link>,
					]
				)}
			</BottomNavigation>
		</Paper>
	);
}
