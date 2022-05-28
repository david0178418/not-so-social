import Link from 'next/link';
import { ModalActions } from '@common/constants';
import { CreateIcon, LoginIcon } from '@components/icons';
import { useRouter } from 'next/router';
import { useIsLoggedIn, useIsLoggedOut } from '@common/hooks';
import { ReactNode } from 'react';
import {
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
						sm: 'inline',
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
									a: ModalActions.CreatePost,
									...query,
								},
							}}
						>
							<ListItemButton>
								<RailButtonContent
									label="Create Post"
								>
									<CreateIcon />
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
				</>
			)}
		</List>
	);
}

export { LeftRail };
