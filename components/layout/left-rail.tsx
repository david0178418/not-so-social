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
							<ListItemIcon>
								<LoginIcon/>
							</ListItemIcon>
							<ListItemText primary="Login" secondary="or register"/>
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
							<ListItemIcon>
								<LoginIcon/>
							</ListItemIcon>
							<ListItemText primary="Logout" />
						</ListItemButton>
					</Link>
				)}
			</ListItem>
		</List>
	);
}

export { LeftRail };
