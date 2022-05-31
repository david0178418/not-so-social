import { useEffect, useState } from 'react';
import { Snackbar, IconButton } from '@mui/material';
import { CloseIcon } from '@components/icons';
import { clearCurrentToastMsgAtom, toastMsgAtom } from '@common/atoms';
import {
	useAtomValue,
	useSetAtom,
} from 'jotai';

export
function Toast() {
	const toastMsg = useAtomValue(toastMsgAtom);
	const clearMsg = useSetAtom(clearCurrentToastMsgAtom);
	const [isOpen, setOpen] = useState(false);

	useEffect(() => {
		setOpen(!!toastMsg);
	}, [toastMsg]);

	function handleClose() {
		setOpen(false);
	}

	return (
		<>
			<Snackbar
				open={isOpen}
				autoHideDuration={4000}
				onClose={handleClose}
				TransitionProps={{ onExited: () => clearMsg() }}
				message={toastMsg}
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
