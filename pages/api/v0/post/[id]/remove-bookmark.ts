import type { NextApiRequest, NextApiResponse } from 'next';

import { getCollection } from '@common/server/mongodb';
import { DbCollections } from '@common/constants';
import { DbBookmark } from '@common/server/db-schema';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const postId = req.query.id as string;

	try {
		const { user } = await getSession({ req }) || {};

		if(!user) {
			return res
				.status(401)
				.send({
					ok: false,
					msg: 'Not logged in',
				});
		}

		const col = await getCollection<DbBookmark>(DbCollections.PostBookmarks);

		col.deleteOne(
			{
				userId: user.id,
				postId: new ObjectId(postId),
			},
		);


		return res
			.status(200)
			.json({ ok: true });
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
