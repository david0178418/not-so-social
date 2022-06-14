import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { CreateIcon, LoginIcon } from '@components/icons';
import { useRouter } from 'next/router';
import { useIsLoggedIn, useIsLoggedOut } from '@common/hooks';
import { ReactNode } from 'react';
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
	const isLoggedIn = useIsLoggedIn();
	const isLoggedOut = useIsLoggedOut();
	const {
		pathname,
		query,
	} = router;

	return (
		<>
			<Typography>
				Pinboard
			</Typography>
			<List>
				{isLoggedOut && (
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
				{isLoggedIn && (
					<>
						<ListItem disablePadding>
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
								<ListItemButton>
									<RailButtonContent
										label="Logout"
									>
										<LoginIcon/>
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
