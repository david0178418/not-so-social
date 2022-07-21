import { ReactNode } from 'react';

import Head from 'next/head';
import { BottomNav } from './bottom-nav';
import { LeftRail } from './left-rail';
import { AppName } from '@common/constants';
import dynamic from 'next/dynamic';
import {
	Container,
	Grid,
} from '@mui/material';

const CommonModals = dynamic(() => import('./common-stuff'), { ssr: false });

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
				<title>{AppName} {title ? `- ${title}` : ''}</title>
				<meta name="description" content={AppName} />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Container
				sx={{
					display: 'flex',
					height: '100vh',
					overflow: 'hidden',
					paddingX: {
						xs: 0,
						sm: 1,
						lg: 2,
					},
				}}
			>
				<Grid
					container
					columns={16}
					spacing={2}
					marginY={0}
				>
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
						style={{
							maxHeight: '100%',
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						{children}
					</Grid>
				</Grid>
			</Container>
			<BottomNav/>
			<CommonModals />
		</>
	);
}
