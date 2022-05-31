import type { ReactNode } from 'react';

import Head from 'next/head';
import { TitleBar } from './title-bar';
import { RightRail } from './right-rail';
import { LeftRail } from './left-rail';
import {
	Container,
	Grid,
} from '@mui/material';
import { Loader } from '@components/loader';

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
						xs={2}
						md={4}
					>
						<LeftRail/>
					</Grid>
					<Grid
						item
						xs={14}
						md={8}
					>
						{children}
					</Grid>
					<Grid
						item
						// sm={4}
						md={4}
						sx={{
							display: {
								xs: 'none',
								sm: 'block',
							},
						}}
					>
						<RightRail/>
					</Grid>
				</Grid>
			</Container>
			<Loader />
		</>
	);
}
