import { z, ZodType } from 'zod';
import { MongoObjectId } from '@server/validations';
import {
	LinkPreviewData,
	LinkPreviewSaveType,
	PostSaveSchema,
	VideoLinkPreviewData,
} from '@common/types';
import {
	MaxPostAttachmentAnnotationLength,
	MaxPostBodyLength,
	MaxPostCost,
	MaxPostTitleLength,
	MinPostBodyLength,
	MinPostCost,
	MinPostTitleLength,
} from '@common/constants';

const ExternalLinkPreviewVideoSchema: ZodType<VideoLinkPreviewData> = z.object({
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

const ExternalLinkPreviewSchema: ZodType<LinkPreviewData> = z.object({
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
		.array(ExternalLinkPreviewVideoSchema),
	favicons: z
		.array(
			z.string().max(300)
		),
});

const LinkPreviewSchema: ZodType<LinkPreviewSaveType> = z.object({
	type: z.union([z.literal('link'), z.literal('post')]),
	annotation: z
		.string()
		.max(MaxPostAttachmentAnnotationLength, { message: `Annotation may not be more than ${MaxPostAttachmentAnnotationLength} characters long` })
		.optional(),
	link: ExternalLinkPreviewSchema.optional(),
	postId: MongoObjectId.optional(),
});

export
const PostSaveValidation: ZodType<PostSaveSchema> = z.object({
	body: z
		.string()
		.min(MinPostBodyLength, { message: `Post body must be at least ${MinPostBodyLength} characters long.` })
		.max(MaxPostBodyLength, { message: `Post body can be no more than ${MaxPostBodyLength} characters long.` }),
	title: z
		.string()
		.min(MinPostTitleLength, { message: `Post title must be at least ${MinPostTitleLength} characters long.` })
		.max(MaxPostTitleLength, { message: `Post title can be no more than ${MaxPostTitleLength} characters long.` }),
	points: z
		.number()
		.min(MinPostCost, { message: `Must spend at least ${MinPostCost} points` })
		.max(MaxPostCost, { message: `Can't spend more than  ${MaxPostCost} points` }),
	linkPreviews: z
		.array(LinkPreviewSchema)
		.optional(),
	nsfw: z
		.boolean()
		.optional(),
	nsfl: z
		.boolean()
		.optional(),
	parentId: MongoObjectId
		.optional(),
});
