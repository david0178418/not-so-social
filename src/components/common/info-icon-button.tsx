import type { TooltipProps } from '@mui/material/Tooltip';

import { InfoIcon } from '@components/icons';
import { IconButton, Tooltip } from '@mui/material';

interface Props {
	label: string;
	placement?: TooltipProps['placement'];
}

export
function InfoIconButton(props: Props) {
	const {
		label,
		placement = 'bottom',
	} = props;
	return (
		<Tooltip title={label} placement={placement}>
			<IconButton size="small">
				<InfoIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
