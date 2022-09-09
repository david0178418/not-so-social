import '@styles/globals.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { AppProps } from 'next/app';

import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { Layout } from '@components/layout';
import { createTheme, ThemeProvider } from '@mui/material';
import { Session } from 'next-auth';

interface Props {
	session: Session | null;
	initialState: any;
}

const theme = createTheme({
	palette: {
		primary: {
			main: '#5271ff',
			light: 'rgb(116, 141, 255)',
			dark: 'rgb(57, 79, 178)',
			contrastText: '#fff',
		},
	},
});

function App(props: AppProps<Props>) {
	const {
		Component,
		pageProps: {
			session,
			...pageProps
		},
	} = props;

	return (
		<>
			<Head>
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
				<link rel="manifest" href="/site.webmanifest"/>
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
				<meta name="msapplication-TileColor" content="#da532c"/>
				<meta name="theme-color" content="#ffffff"/>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
			</Head>
			<ThemeProvider theme={theme}>
				<SessionProvider session={session}>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</SessionProvider>
			</ThemeProvider>
		</>);
}

export default App;
