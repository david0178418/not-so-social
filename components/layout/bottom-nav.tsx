import { useState } from 'react';
import {
	BottomNavigation,
	BottomNavigationAction,
	Fab,
	Paper,
} from '@mui/material';
import {
	BookmarkIcon,
	CreateIcon,
	HomeIcon,
} from '@components/icons';

export
function BottomNav() {
	const [value, setValue] = useState(0);

	return (
		<Paper
			elevation={3}
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				display: {
					xs: 'inline',
					sm: 'none',
				},
			}}
		>
			<Fab
				color="primary"
				style={{
					position: 'absolute',
					top: -64,
					right: 16,
				}}
			>
				<CreateIcon/>
			</Fab>
			<BottomNavigation
				showLabels
				value={value}
				onChange={(event, newValue) => setValue(newValue)}
			>
				<BottomNavigationAction label="Home" icon={<HomeIcon />} />
				<BottomNavigationAction label="Bookmarks" icon={<BookmarkIcon />} />
			</BottomNavigation>
		</Paper>
	);
}
