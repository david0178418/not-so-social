import { NextSeo } from 'next-seo';
import NotSoSocialImg from '@components/layout/left-rail/NotSo.Social.png';
import NotSoSocialStackedImg from '@components/layout/left-rail/NotSo.Social-stacked.png';
import NotSoSocialMedImg from '@components/layout/left-rail/NotSo.Social-med.png';
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

const NotSoSocialImgSrc = urlJoin(BaseUrl, NotSoSocialImg.src);
const NotSoSocialStackedImgSrc = urlJoin(BaseUrl, NotSoSocialStackedImg.src);
const NotSoSocialMedImgSrc = urlJoin(BaseUrl, NotSoSocialMedImg.src);
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
						url: NotSoSocialStackedImgSrc,
						width: NotSoSocialStackedImg.width,
						height: NotSoSocialStackedImg.height,
						alt: 'NoSo.Social',
						type: 'image/png',
					}, {
						url: NotSoSocialImgSrc,
						width: NotSoSocialImg.width,
						height: NotSoSocialImg.height,
						alt: 'NoSo.Social',
						type: 'image/png',
					}, {
						url: NotSoSocialMedImgSrc,
						width: NotSoSocialMedImg.width,
						height: NotSoSocialMedImg.height,
						alt: 'NoSo.Social',
						type: 'image/png',
					}, {
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
