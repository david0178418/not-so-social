import type { NextApiRequest, NextApiResponse } from 'next';
import type { DbNotification } from '@common/server/db-schema';

import { DbCollections, NotLoggedInErrMsg } from '@common/constants';
import { getServerSession } from '@common/server/auth-options';
import { ObjectId } from 'mongodb';
import { getCollection } from '@common/server/mongodb';

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	const userId = new ObjectId(user.id);
	const notifications = await fetchUserNotifications(userId);

	res.send({
		ok: true,
		data: { notifications },
	});
}

async function fetchUserNotifications(userId: ObjectId) {
	const col = await getCollection(DbCollections.Notifications);

	const result = await col.aggregate<DbNotification>([
		{
			$match: {
				userId,
				readOn: null,
			},
		},
		{ $sort: { date: -1 } },
		{ $limit: 10 },
	]).toArray();

	return result;
}
