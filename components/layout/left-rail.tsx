import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
	AppName,
	HomePaths,
	ModalActions,
	Paths,
} from '@common/constants';
import {
	BookmarkIcon,
	BookmarkActiveIcon,
	CreateIcon,
	HomeIcon,
	HomeActiveIcon,
	LoginIcon,
	ProfileIcon,
	ProfileActiveIcon,
	PostIcon,
	PostActiveIcon,
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

// TODO Implement better path matching for active icon

function LeftRail() {
	const router = useRouter();
	const { data } = useSession();
	const {
		pathname,
		asPath,
		query,
	} = router;
	const user = data?.user;

	return (
		<>
			<Typography>
				{AppName}
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
									HomePaths.includes(asPath as any) ?
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
				{!!user && (
					<>
						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.ProfilePosts}
							>
								<ListItemButton>
									<RailButtonContent label="My Posts">
										{
											Paths.ProfilePosts === asPath ?
												<PostActiveIcon /> :
												<PostIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.Bookmarks}
							>
								<ListItemButton>
									<RailButtonContent label="Bookmarks" >
										{
											Paths.Bookmarks === asPath ?
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
											Paths.Profile === asPath ?
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
