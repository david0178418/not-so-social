import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { Toast } from '@components/toast';
import {
	Provider,
	useCreateStore,
} from '@common/store';

import type { AppProps } from 'next/app';

import '@styles/globals.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

interface Props {
	initialState: any;
}

function MyApp(props: AppProps<Props>) {
	const {
		Component,
		pageProps: {
			session,
			...pageProps
		},
	} = props;


	const createStore = useCreateStore(pageProps.initialState);

	return (
		<>
			<Head>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
			</Head>
			<SessionProvider session={session}>

				<Provider createStore={createStore}>
					<Component {...pageProps} />
					<Toast/>
				</Provider>
			</SessionProvider>
		</>);
}

export default MyApp;
