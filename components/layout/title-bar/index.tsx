import Link from 'next/link';
import { BackIcon } from '@components/icons';
import { LoginModal } from '@components/modals/login.modal';
import { LogoutModal } from '@components/modals/logout.modal';
import {
	AppBar,
	Box,
	IconButton,
	Toolbar,
	Typography,
} from '@mui/material';
import { CreatePostModal } from '@components/modals/create-post.modal';

interface Props {
	showBack?: boolean;
}

export
function TitleBar(props: Props) {
	const { showBack } = props;

	return (
		<>
			<Box
				sx={{
					marginBottom: 9,
					flexGrow: 1,
				}}
			>
				<AppBar position="fixed">
					<Toolbar>
						{showBack && (
							<Link href="/" passHref>
								<IconButton
									size="large"
									edge="start"
									color="inherit"
									sx={{ mr: 2 }}
								>
									<BackIcon />
								</IconButton>
							</Link>
						)}
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1 }}
						>
							Pinboard
						</Typography>
					</Toolbar>
				</AppBar>
			</Box>
			{/** TODO: Need to figure out where to put these */}
			<LoginModal/>
			<LogoutModal/>
			<CreatePostModal/>
		</>
	);
}
