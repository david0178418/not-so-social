// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ZodType } from 'zod';

import { z } from 'zod';
import { getServerSession } from '@server/auth-options';
import { FeedTypeQueryMap } from '@server/queries';
import {
	FeedTypes,
	ISODateStringLength,
	MaxSearchTermSize,
} from '@common/constants';

interface Schema {
	afterTimeISO?: string;
	bar?: string;
	searchTerm?: string;
	type: FeedTypes;
}

const schema: ZodType<Schema> = z.object({
	fromIndex: z
		.number()
		.optional(),
	searchTerm: z
		.string()
		.max(MaxSearchTermSize)
		.optional(),
	afterTimeISO: z
		.string()
		.max(ISODateStringLength)
		.optional(),
	type: z.nativeEnum(FeedTypes),
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const result = await schema.safeParseAsync({
		...req.query,
		// @ts-ignore
		fromIndex: +req.query.fromIndex || 0,
	});

	if(!result.success) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: result
					.error
					.errors
					.map(e => e.message),
			});
	}

	const {
		type,
		...args
	} = result.data;

	const session = await getServerSession(req, res);
	const userId = session?.user.id;

	const feed = await FeedTypeQueryMap[type]({
		userId,
		...args,
	});

	res.status(200).json({
		ok: true,
		data: { feed },
	});
}
