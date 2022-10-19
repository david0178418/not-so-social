import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { formatCompactNumber } from '@common/utils';
import { ReactNode } from 'react';
import { useBalance } from '@common/hooks';
import Image from 'next/image';
import NotSoSocialImg from '@components/layout/left-rail/NotSo.Social.png';
import NotSoSocialSmallImg from './NotSo.Social-small.png';
import {
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
	FaqActiveIcon,
	FaqIcon,
} from '@components/icons';
import {
	Box,
	Fab,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
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
	const balance = useBalance();
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
			<Link passHref href={Paths.Home}>
				<Box
					component="a"
					sx={{
						textAlign: 'center',
						width: '100%',
						paddingLeft: 1.5,
					}}
				>
					<Box
						sx={{
							display: {
								xs: 'none',
								md: 'block',
							},
						}}
					>
						<Image src={NotSoSocialImg} />
					</Box>
					<Box
						sx={{
							display: {
								xs: 'block',
								md: 'none',
							},
						}}
					>
						<Image src={NotSoSocialSmallImg} />
					</Box>
				</Box>
			</Link>
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
					<>

						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.Faq}
							>
								<ListItemButton>
									<RailButtonContent
										label="Uhh...Wut?"
									>
										{
											Paths.Faq === pathname ?
												<FaqActiveIcon /> :
												<FaqIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
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
					</>
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
											Paths.ProfilePosts === pathname ?
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
									<RailButtonContent
										label={user.username}
										secondary={balance ? `${formatCompactNumber(balance)} points` : ''}
									>
										{
											Paths.Profile === pathname ?
												<ProfileActiveIcon /> :
												<ProfileIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
						<ListItem disablePadding>
							<Link
								shallow
								passHref
								href={Paths.Faq}
							>
								<ListItemButton>
									<RailButtonContent
										label="Uhh...Wut?"
									>
										{
											Paths.Faq === pathname ?
												<FaqActiveIcon /> :
												<FaqIcon />
										}
									</RailButtonContent>
								</ListItemButton>
							</Link>
						</ListItem>
						<Link
							shallow
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
