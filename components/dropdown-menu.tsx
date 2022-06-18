import { Button } from '@mui/material';
import { Menu } from '@mui/material';
import { MoreIcon } from '@components/icons';
import {
	ComponentProps,
	useState,
	useRef,
} from 'react';

type Props = ComponentProps<typeof Button>;

export
function DropdownMenu(props: Props) {
	const {
		children,
		onClick,
		...triggerProps
	} = props;

	const [isOpen, setIsOpen] = useState(false);
	const anchorEl = useRef(null);

	return (
		<>
			<Button
				{...triggerProps}
				ref={anchorEl}
				onClick={e => {
					setIsOpen(true);
					onClick?.(e);
				}}
			>
				<MoreIcon/>
			</Button>
			<Menu
				anchorEl={anchorEl.current}
				onClick={() => setIsOpen(false)}
				onClose={() => setIsOpen(false)}
				open={isOpen}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				{children}
			</Menu>
		</>
	);
}
