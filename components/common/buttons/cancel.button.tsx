import type { CommonButtonProps } from '@common/types';
import { CancelIcon } from '@components/icons';
import { Button } from '@mui/material';
import { forwardRef } from 'react';

export
const CancelButton = forwardRef<HTMLButtonElement, CommonButtonProps>((props: CommonButtonProps, ref) => {
	const {
		children,
		label,
		href,
		onClick,
	} = props;
	const renderedLabel = label || children || 'Cancel';

	return (
		<Button
			color="error"
			href={href}
			ref={ref}
			onClick={onClick}
			endIcon={<CancelIcon />}
		>
			{renderedLabel}
		</Button>
	);
});
