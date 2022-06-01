import type { GetServerSideProps, NextPage } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Head from 'next/head';
import { Layout } from '@components/layout';
import { Post } from '@common/types';
import { getPost } from '@common/server/db-calls';

interface Props {
	post: Post | null;
}

interface Params extends ParsedUrlQuery {
	id?: string;
}

export
const getServerSideProps: GetServerSideProps<Props, Params> = async (props) => {
	const { params: { id = '' } = {} } = props;

	return { props: { post: await getPost(id) } };
};

const Home: NextPage<Props> = (props) => {
	const { post } = props;

	return (
		<Layout>
			<div>
				<Head>
					<title>Pinboard - </title>
				</Head>
				<main>
					<pre>
						{post && (
							JSON.stringify(post, null, 4)
						)}
					</pre>
				</main>
			</div>
		</Layout>
	);
};

export default Home;
