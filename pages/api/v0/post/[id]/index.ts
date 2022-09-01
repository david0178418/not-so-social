import type { NextApiRequest, NextApiResponse } from 'next';

import { NotLoggedInErrMsg } from '@common/constants';
import { getServerSession } from '@common/server/auth-options';
import { fetchPost } from '@common/server/queries';
import { MongoObjectId } from '@common/server/validations';
import { z, ZodType } from 'zod';

interface Schema {
	id: string;
}

const schema: ZodType<Schema> = z.object({ id: MongoObjectId });

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { user } = await getServerSession(req, res) || {};

		if(!user?.id) {
			return res.status(401).send(NotLoggedInErrMsg);
		}

		const result = await schema.safeParseAsync(req.query);

		if(!result.success) {
			console.log(result.error);
			return res
				.status(400)
				.send({ ok: false });
		}

		const { id: postId } = result.data;

		return res
			.status(200)
			.json({
				ok: true,
				data: { post: await fetchPost(postId, user.id) },
			});
	} catch (message) {
		console.error(message);
		return res
			.status(500)
			.json({
				ok: false,
				message,
			});
	}
}
