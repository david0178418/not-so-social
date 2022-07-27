
import { LinkPreviewData, VideoLinkPreviewData } from '@common/types';
import { z, ZodType } from 'zod';
import { MaxPostBodyLength } from '@common/constants';

export
const MongoObjectId = z
	.string()
	.trim()
	.length(24);

export
const linkPreviewVideoSchema: ZodType<VideoLinkPreviewData> = z.object({
	url: z
		.string()
		.max(300)
		.optional(),
	secureUrl: z
		.string()
		.max(500)
		.optional(),
	type: z
		.string()
		.max(100)
		.optional(),
	height: z
		.string()
		.max(4)
		.optional(),
	width: z
		.string()
		.max(4)
		.optional(),
});

export
const linkPreviewSchema: ZodType<LinkPreviewData> = z.object({
	url: z
		.string()
		.max(MaxPostBodyLength),
	title: z
		.string()
		.max(MaxPostBodyLength),
	siteName: z
		.string()
		.max(100)
		.optional(),
	description: z
		.string()
		.max(1000)
		.optional(),
	mediaType: z
		.string()
		.max(50)
		.optional(),
	contentType: z
		.string()
		.max(50)
		.optional(),
	images: z
		.array(
			z.string().max(300)
		),
	videos: z
		.array(linkPreviewVideoSchema),
	favicons: z
		.array(
			z.string().max(300)
		),
});
