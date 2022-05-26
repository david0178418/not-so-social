import { ModalActions } from '@common/constants';
import { LoginIcon } from '@components/icons';
import { useRouter } from 'next/router';
import { useIsLoggedIn, useIsLoggedOut } from '@common/hooks';
import Link from 'next/link';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { ReactNode } from 'react';

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
			<ListItem disablePadding>
				{isLoggedOut && (
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
				)}
				{isLoggedIn && (
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
				)}
			</ListItem>
		</List>
	);
}

export { LeftRail };
