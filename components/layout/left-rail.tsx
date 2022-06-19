import Link from 'next/link';
import { ModalActions, Paths } from '@common/constants';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
	BookmarkIcon,
	BookmarkActiveIcon,
	CreateIcon,
	HomeIcon,
	HomeActiveIcon,
	LoginIcon,
	ProfileIcon,
	ProfileActiveIcon,
} from '@components/icons';
import {
	Fab,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';

interface Props {
	label: string;
	secondary?: string;
	children: ReactNode;
}

function RailButtonContent(props: Props) {
	const {
		label,
		secondary = '',
		children,
	} = props;
	return (
		<>
			<ListItemIcon>
				{children}
			</ListItemIcon>
			<ListItemText
				primary={label}
				secondary={secondary}
				sx={{
					display: {
						xs: 'none',
						md: 'inline',
					},
				}}
			/>
		</>
	);
}

function LeftRail() {
	const router = useRouter();
	const { data } = useSession();
	const {
		pathname,
		query,
	} = router;

	const user = data?.user;

	return (
		<>
			<Typography>
				Pinboard
			</Typography>
			<List>
				<ListItem disablePadding>
					<Link
						shallow
						passHref
						href={Paths.Home}
					>
						<ListItemButton>
							<RailButtonContent label="Home">
								{
									Paths.Home === pathname ?
										<HomeActiveIcon /> :
										<HomeIcon />
								}
							</RailButtonContent>
						</ListItemButton>
					</Link>
				</ListItem>
				{!user && (
					<ListItem disablePadding>
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
							<ListItemButton>
								<RailButtonContent
									label="Login"
									secondary="or register"
								>
									<LoginIcon/>
								</RailButtonContent>
							</ListItemButton>
						</Link>
					</ListItem>
				)}
				{user && (
					<>
						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.Bookmarks}
							>
								<ListItemButton>
									<RailButtonContent label="Bookmarks" >
										{
											Paths.Bookmarks === pathname ?
												<BookmarkActiveIcon /> :
												<BookmarkIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.Profile}
							>
								<ListItemButton>
									<RailButtonContent label={user.username}>
										{
											Paths.Profile === pathname ?
												<ProfileActiveIcon /> :
												<ProfileIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
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
							<a>
								<Fab
									color="primary"
									sx={{
										display: {
											xs: 'inline-flex',
											md: 'none',
										},
									}}
								>
									<CreateIcon/>
								</Fab>
								<Fab
									variant="extended"
									color="primary"
									style={{ width: '100%' }}
									sx={{
										display: {
											xs: 'none',
											md: 'inline-flex',
										},
									}}
								>
									<CreateIcon sx={{ mr: 1 }} />
									Create Post
								</Fab>
							</a>
						</Link>
					</>
				)}
			</List>
		</>
	);
}

export { LeftRail };
