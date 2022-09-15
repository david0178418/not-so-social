import type { CommonButtonProps } from '@common/types';

import { CancelIcon } from '@components/icons';
import { Button as MuiButton } from '@mui/material';
import { forwardRef } from 'react';
import { ConfirmIcon } from '@components/icons';

export
const CancelButton = forwardRef<HTMLButtonElement, CommonButtonProps>((props, ref) => {
	const {
		children,
		label,
		href,
		fullWidth,
		onClick,
	} = props;
	const renderedLabel = label || children || 'Cancel';

	return (
		<MuiButton
			color="error"
			variant="outlined"
			href={href}
			ref={ref}
			fullWidth={fullWidth}
			onClick={onClick}
			endIcon={<CancelIcon />}
		>
			{renderedLabel}
		</MuiButton>
	);
});

export
const ConfirmButton = forwardRef<HTMLButtonElement, CommonButtonProps>((props, ref) => {
	const {
		children,
		disabled,
		label,
		href,
		fullWidth,
		onClick,
	} = props;
	const renderedLabel = label || children || 'Confirm';

	return (
		<MuiButton
			color="success"
			variant="outlined"
			disabled={disabled}
			href={href}
			ref={ref}
			fullWidth={fullWidth}
			onClick={onClick}
			endIcon={<ConfirmIcon />}
		>
			{renderedLabel}
		</MuiButton>
	);
});
