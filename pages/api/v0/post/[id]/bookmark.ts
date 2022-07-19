import type { NextApiRequest, NextApiResponse } from 'next';

import { getCollection } from '@common/server/mongodb';
import { DbCollections, NotLoggedInErrMsg } from '@common/constants';
import { ObjectId } from 'mongodb';
import { nowISOString } from '@common/utils';
import { getServerSession } from '@common/server/auth-options';

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const postId = req.query.id as string;

	try {
		const { user } = await getServerSession(req, res) || {};

		if(!user) {
			return res.status(401).send(NotLoggedInErrMsg);
		}

		const userId = new ObjectId(user.id);
		const postObjId = new ObjectId(postId);

		const col = await getCollection(DbCollections.PostBookmarks);
		const date = nowISOString();
		await col.updateOne(
			{
				userId,
				postId: postObjId,
			},
			{
				$setOnInsert: {
					userId,
					postId: postObjId,
					date,
				},
			},
			{ upsert: true }
		);

		return res
			.status(200)
			.json({
				ok: true,
				data: { date },
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
