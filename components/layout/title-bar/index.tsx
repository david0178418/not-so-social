import Link from 'next/link';
import { BackIcon } from '@components/icons';
import {
	AppBar,
	Box,
	IconButton,
	Toolbar,
	Typography,
} from '@mui/material';

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
					marginBottom: 1,
					flexGrow: 1,
				}}
			>
				<AppBar position="relative">
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
		</>
	);
}
