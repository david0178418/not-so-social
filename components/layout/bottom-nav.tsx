import { useState } from 'react';
import {
	BottomNavigation, BottomNavigationAction, Fab, Paper,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { CreateIcon } from '@components/icons';

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
				<BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
				<BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
				<BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} />
			</BottomNavigation>
		</Paper>
	);
}
