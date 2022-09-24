import { TextField } from '@mui/material';
import {
	useEffect,
	useState,
} from 'react';

type Props = Parameters<typeof TextField>[0] & {
	label: string;
	minLength?: number;
	maxLength?: number;
	value: string;
};

export
function TextFieldLengthValidation(props: Props) {
	const {
		label,
		maxLength = null,
		minLength = null,
		value,
		onBlur,
		...textFieldProps
	} = props;
	const [touched, setTouched] = useState(false);
	const longEnough = minLength === null || minLength < value.length;
	const shortEnough = maxLength === null || value.length < maxLength;
	const isValid = (!touched || longEnough) && shortEnough;
	let errorMsg = '';

	if(touched && !longEnough) {
		errorMsg = `${label} must be at least ${minLength} characters long`;
	} else if(!shortEnough) {
		errorMsg = `${label} must be no more than ${maxLength} characters long`;
	}

	useEffect(() => {
		if(value === '') {
			setTouched(false);
		}
	}, [value]);

	return (
		<TextField
			label={label}
			error={!isValid}
			value={value}
			helperText={errorMsg}
			onBlur={(e) => {
				setTouched(true);
				onBlur?.(e);
			}}
			{...textFieldProps}
		/>
	);
}
