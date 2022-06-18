import type { NextApiRequest, NextApiResponse } from 'next';

import { getCollection } from '@common/server/mongodb';
import { DbCollections, NotLoggedInErrMsg } from '@common/constants';
import { DbBookmark } from '@common/server/db-schema';
import { ObjectId } from 'mongodb';
import { nowISOString } from '@common/utils';
import { getSession } from 'next-auth/react';

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const postId = req.query.id as string;

	try {
		const { user } = await getSession({ req }) || {};

		if(!user) {
			return res.status(401).send(NotLoggedInErrMsg);
		}

		const postObjId = new ObjectId(postId);

		const col = await getCollection<DbBookmark>(DbCollections.PostBookmarks);
		await col.updateOne(
			{
				userId: user.id,
				postId: postObjId,
			},
			{
				$setOnInsert: {
					userId: user.id,
					postId: postObjId,
					date: nowISOString(),
				},
			},
			{ upsert: true }
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
