import type { NextApiRequest, NextApiResponse } from 'next';

import { NotLoggedInErrMsg } from '@common/constants';
import { getServerSession } from '@common/server/auth-options';
import { fetchUserNotifications } from '@common/server/queries';
import { ObjectId } from 'mongodb';

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
