import type { CommonButtonProps } from '@common/types';
import { ConfirmIcon } from '@components/icons';
import { Button } from '@mui/material';
import { forwardRef } from 'react';

export
const ConfirmButton = forwardRef<HTMLButtonElement, CommonButtonProps>((props, ref) => {
	const {
		children,
		label,
		href,
		onClick,
	} = props;
	const renderedLabel = label || children || 'Confirm';

	return (
		<Button
			color="success"
			href={href}
			ref={ref}
			onClick={onClick}
			endIcon={<ConfirmIcon />}
		>
			{renderedLabel}
		</Button>
	);
});
