import { LinkPreviewData } from '@common/types';
import { z, ZodType } from 'zod';
import { linkPreviewSchema, MongoObjectId } from '@server/validations';
import {
	MaxPostAttachmentAnnotationLength,
	MaxPostBodyLength,
	MaxPostCost,
	MaxPostTitleLength,
	MinPostBodyLength,
	MinPostCost,
	MinPostTitleLength,
} from '@common/constants';

interface AttachmentIds {
	annotation: string;
	postId: string;
}

export
interface PostSaveSchema {
	attachments?: AttachmentIds[];
	body: string;
	title: string;
	points: number;
	parentId?: string;
	linkPreviews?: LinkPreviewData[];
}

export
const PostSaveValidation: ZodType<PostSaveSchema> = z.object({
	attachments: z
		.array(
			z.object({
				annotation: z
					.string()
					.max(MaxPostAttachmentAnnotationLength, { message: `Annotation may not be more than ${MaxPostAttachmentAnnotationLength} characters long` }),
				postId: MongoObjectId,
			})
		)
		.optional(),
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
		.array(linkPreviewSchema)
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
