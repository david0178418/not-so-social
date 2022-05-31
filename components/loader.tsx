import { loadingAtom } from '@common/atoms';
import { useAtomValue } from 'jotai';
import {
	Backdrop,
	CircularProgress,
} from '@mui/material';

export
function Loader() {
	const loading = useAtomValue(loadingAtom);

	return (
		<Backdrop
			open={loading}
			sx={{
				color: '#fff',
				zIndex: (theme) => theme.zIndex.modal + 1,
			}}
		>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
}
