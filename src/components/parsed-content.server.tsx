
import { Link as MuiLink } from '@mui/material';
import { Interweave } from 'interweave';
import { polyfill } from 'interweave-ssr';
import { Paths } from '@common/constants';
import Link from 'next/link';
import {
	UrlMatcher,
	HashtagMatcher,
	HashtagProps,
	UrlProps,
} from 'interweave-autolink';

polyfill();

interface Props {
	children: string;
}

export
function ParsedContentServer(props: Props) {
	const { children } = props;

	return (
		<Interweave
			content={children}
			matchers={[new UrlMatcher('url', {}, Url), new HashtagMatcher('hashtag', {}, Hashtag)]}
		/>
	);
}

function Url(props: UrlProps) {
	const { url } = props;

	return (
		<MuiLink href={url} target="__blank">
			{url}
		</MuiLink>
	);
}

function Hashtag(props: HashtagProps) {
	const { hashtag } = props;

	return (

		<Link href={`${Paths.Search}?q=${encodeURIComponent(hashtag)}`} passHref>
			<MuiLink>
				{hashtag}
			</MuiLink>
		</Link>
	);
}
