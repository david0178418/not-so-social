// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ZodType } from 'zod';

import { FeedTypes } from '@common/constants';
import { z } from 'zod';
import { getServerSession } from '@common/server/auth-options';
import { FeedTypeQueryMap } from '@common/server/queries';

interface Schema {
	bar?: string;
	foo?: string;
	type: FeedTypes;
}

const schema: ZodType<Schema> = z.object({
	foo: z.string().optional(),
	bar: z.string().optional(),
	type: z.nativeEnum(FeedTypes),
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const result = await schema.safeParseAsync(req.query);

	if(!result.success) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: result.error.errors.map(e => e.message),
			});
	}

	const { type } = result.data;

	const session = await getServerSession(req, res);
	const userId = session?.user.id;

	let feed: any = {
		posts: [],
		parentPostMap: {},
		responsePostMap: {},
	};

	feed = await FeedTypeQueryMap[type]({
		userId,
		searchTerm: '',
	});

	res.status(200).json({
		ok: true,
		data: { feed },
	});
}
