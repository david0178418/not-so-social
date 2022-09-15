import { Paths } from '@common/constants';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
	Tab,
	Tabs,
} from '@mui/material';

const Sorts = {
	['/']: 'hot',
	new: 'new',
	top: 'top',
};

export
function HomeSortTabs() {
	const { query } = useRouter();
	const { params = [Paths.Home] } = query;
	// @ts-ignore
	const value = Sorts[params[0]] || 'hot';

	return (
		<Tabs value={value} variant="fullWidth">
			<Link
				passHref
				href={Paths.Home}
				// @ts-ignore for "value" prop being passed to tab, which can't be set directly for some reason
				value={Sorts['/']}
			>
				<Tab
					LinkComponent="a"
					label="Hot"
					sx={{ flex: 1 }}
				/>
			</Link>
			<Link
				passHref
				href={Paths.HomeNew}
				// @ts-ignore for "value" prop being passed to tab, which can't be set directly for some reason
				value={Sorts.new}
			>
				<Tab
					LinkComponent="a"
					label="New"
					sx={{ flex: 1 }}
				/>
			</Link>
			<Link
				passHref
				href={Paths.HomeTop}
				// @ts-ignore for "value" prop being passed to tab, which can't be set directly for some reason
				value={Sorts.top}
			>
				<Tab
					LinkComponent="a"
					label="Top"
					sx={{ flex: 1 }}
				/>
			</Link>
		</Tabs>
	);
}
