import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
	HomePaths,
	ModalActions,
	Paths,
} from '@common/constants';
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
	FaqActiveIcon,
	FaqIcon,
	HomeActiveIcon,
	HomeIcon,
	LoginIcon,
	PostActiveIcon,
	PostIcon,
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
				<Link
					shallow
					passHref
					href={{
						pathname,
						query: {
							a: ModalActions.CreatePost,
							...query,
						},
					}}
				>
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
				</Link>
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
							HomePaths.includes(asPath as any) ?
								<HomeActiveIcon /> :
								<HomeIcon />
						}
					/>
				</Link>
				{!user && (
					[
						<Link
							key="0"
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
						</Link>,
						<Link
							key="1"
							shallow
							passHref
							href={Paths.Faq}
						>
							<BottomNavigationAction
								label="Uhh...Wut?"
								icon={
									Paths.Faq === pathname ?
										<FaqActiveIcon /> :
										<FaqIcon />
								}
							/>
						</Link>,
					]
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
									Paths.Bookmarks === pathname ?
										<BookmarkActiveIcon /> :
										<BookmarkIcon />
								}
							/>
						</Link>,
						<Link
							key="b"
							shallow
							passHref
							href={Paths.ProfilePosts}
						>
							<BottomNavigationAction
								label="My Posts"
								icon={
									Paths.ProfilePosts === pathname ?
										<PostActiveIcon /> :
										<PostIcon />
								}
							/>
						</Link>,
						<Link
							key="c"
							shallow
							passHref
							href={Paths.Profile}
						>
							<BottomNavigationAction
								label={user.username}
								icon={
									Paths.Profile === pathname ?
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
