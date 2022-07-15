import { AppName, Paths } from '@common/constants';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { SearchIcon } from './icons';

interface Props {
	placeholder?: string;
	value?: string;
}

export
// TODO Simplify this to an actual form submission
function SearchForm(props: Props) {
	const {
		placeholder = `Search ${AppName}`,
		value: searchTerm = '',
	} = props;
	const [searchQueary, setSearchQuery] =  useState(searchTerm);
	const { push } = useRouter();

	function handleSubmit() {
		push({
			pathname: Paths.Search,
			query: { q: searchQueary },
		});
	}

	function handleKeyUp(key: string) {
		if(key === Key.Enter) {
			handleSubmit();
		}
	}

	return (
		<TextField
			fullWidth
			placeholder={placeholder}
			value={searchQueary}
			onKeyUp={e => handleKeyUp(e.key)}
			onChange={e => setSearchQuery(e.target.value)}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<SearchIcon />
					</InputAdornment>
				),
			}}
		/>
	);
}
