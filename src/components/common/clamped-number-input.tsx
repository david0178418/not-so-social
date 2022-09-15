import { useDebounce } from '@common/hooks';
import { clamp } from '@common/utils';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
	autoFocus?: boolean;
	label: string;
	disabled?: boolean;
	fullWidth?: boolean;
	value: number;
	min?: number;
	max?: number;
	onChange?: (newVal: number) => void;
}

export
function ClampedNumberInput(props: Props) {
	const {
		autoFocus,
		label,
		disabled,
		fullWidth,
		value,
		onChange = () => null,
		min = Number.MIN_SAFE_INTEGER,
		max = Number.MAX_SAFE_INTEGER,
	} = props;
	const [internalVal, setInternalVal] = useState(Math.floor(value));
	const rawClampedVal = Math.floor(clamp(internalVal, min, max));
	const clampedVal = useDebounce(rawClampedVal, 300);

	useEffect(() => {
		handleUpdate();
	}, [clampedVal]);

	function handleUpdate() {
		setInternalVal(clampedVal);
		onChange(clampedVal);
	}

	return (
		<TextField
			autoFocus={autoFocus}
			type="number"
			variant="standard"
			fullWidth={fullWidth}
			label={label}
			onBlur={handleUpdate}
			disabled={disabled}
			value={internalVal || ''}
			onChange={e => {
				const val = +e.target.value;
				if(val !== internalVal) {
					setInternalVal(+e.target.value);
				}
			}}
			inputProps={{
				min: 0,
				step: 1,
				pattern: '[0-9]{10}',
			}}
		/>
	);
}
