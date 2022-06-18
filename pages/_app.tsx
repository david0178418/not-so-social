import '@styles/globals.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { AppProps } from 'next/app';

import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { Toast } from '@components/toast';
import { Layout } from '@components/layout';

interface Props {
	initialState: any;
}

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
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
			</Head>
			<SessionProvider session={session}>
				<Layout>
					<Component {...pageProps} />
				</Layout>
				<Toast/>
			</SessionProvider>
		</>);
}

export default App;
