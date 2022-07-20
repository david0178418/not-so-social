import { useEffect, useState } from 'react';
import { Snackbar, IconButton } from '@mui/material';
import { CloseIcon } from '@components/icons';
import { clearCurrentToastMsgAtom, toastMsgAtom } from '@common/atoms';
import {
	useAtomValue,
	useSetAtom,
} from 'jotai';
import { DefaultToastMsgDelay } from '@common/constants';

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
				autoHideDuration={toastMsg.delay || DefaultToastMsgDelay}
				onClose={handleClose}
				TransitionProps={{ onExited: () => clearMsg() }}
				message={toastMsg.message}
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
