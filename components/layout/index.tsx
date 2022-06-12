import type { ReactNode } from 'react';

import Head from 'next/head';
import { Loader } from '@components/loader';
import { BottomNav } from './bottom-nav';
import { TitleBar } from './title-bar';
import { LeftRail } from './left-rail';
import {
	Container,
	Grid,
} from '@mui/material';

interface Props {
	title?: string;
	children?: ReactNode;
}

export
function Layout(props: Props) {
	const {
		title,
		children,
	} = props;

	return (
		<>
			<Head>
				<title>Pinboard {title ? `- ${title}` : ''}</title>
				<meta name="description" content="Pinboard" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<TitleBar/>

			<Container>
				<Grid container columns={16} spacing={2}>
					<Grid
						item
						sm={2}
						md={4}
						sx={{
							display: {
								xs: 'none',
								sm: 'block',
							},
						}}
					>
						<LeftRail/>
					</Grid>
					<Grid
						item
						xs={16}
						sm={14}
						md={12}
					>
						{children}
					</Grid>
				</Grid>
			</Container>
			<BottomNav/>
			<Loader />
		</>
	);
}
