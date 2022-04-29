import { ModalActions } from '@common/constants';
import { LoginIcon } from '@components/icons';
import { useRouter } from 'next/router';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import Link from 'next/link';

function LeftRail() {
	const router = useRouter();
	const {
		pathname,
		query,
	} = router;

	return (
		<List>
			<ListItem disablePadding>
				<Link
					shallow
					passHref
					href={{
						pathname,
						query: {
							a: ModalActions.Login,
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
			</ListItem>
		</List>
	);
}

export { LeftRail };
