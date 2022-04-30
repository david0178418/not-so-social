import { useStore } from '@common/store';
import { useEffect, useState } from 'react';
import { setToastMsg } from '@common/store-actions';
import { Snackbar, IconButton } from '@mui/material';
import { CloseIcon } from '@components/icons';

export
function Toast() {
	const toastMsg = useStore(s => s.toastQueuedMessages);
	const [isOpen, setOpen] = useState(false);

	useEffect(() => {
		setOpen(!!toastMsg.length);
	}, [toastMsg.length]);

	function handleClose() {
		setOpen(false);
	}

	return (
		<>
			<Snackbar
				open={isOpen}
				autoHideDuration={4000}
				onClose={handleClose}
				TransitionProps={{ onExited: () => setToastMsg([]) }}
				message={toastMsg[0]}
				action={
					<IconButton
						size="small"
						color="inherit"
						onClick={handleClose}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				}
			/>
		</>
	);
}
