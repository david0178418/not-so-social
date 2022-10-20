import { NextSeo } from 'next-seo';
import NotSoSocialMedJpegImg from '@components/layout/left-rail/NotSo.Social-med.jpg';
import { urlJoin } from '@common/utils';
import {
	AppName,
	BaseUrl,
} from '@common/constants';

interface Props {
	title?: string;
	description?: string;
	path?: string;
}

const NotSoSocialMedJpegImgSrc = urlJoin(BaseUrl, NotSoSocialMedJpegImg.src);

export
function Seo(props: Props) {
	const {
		title = AppName,
		description = AppName,
		path = '/',
	} = props;

	return (
		<>
			<NextSeo
				title={title}
				description={description}
				twitter={{
					site: '@NotSoSocialApp',
					cardType: 'summary_large_image',
				}}
				openGraph={{
					url: urlJoin(BaseUrl, path),
					title,
					site_name: AppName,
					images: [ {
						url: NotSoSocialMedJpegImgSrc,
						width: NotSoSocialMedJpegImg.width,
						height: NotSoSocialMedJpegImg.height,
						alt: 'NoSo.Social',
						type: 'image/jpeg',
					}],
				}}
			/>
		</>
	);
}
