import Head from 'next/head';

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
		pageProps,
	} = props;

	return (
		<>
			<Head>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
			</Head>
			<Component {...pageProps} />
		</>);
}

export default MyApp;
