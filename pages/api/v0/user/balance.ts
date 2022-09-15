import type { NextApiRequest, NextApiResponse } from 'next';

import { NotLoggedInErrMsg } from '@common/constants';
import { getServerSession } from '@server/auth-options';
import { fetchUserBalance } from '@server/queries';
import { ObjectId } from 'mongodb';

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	const ownerId = new ObjectId(user.id);
	const balance = await fetchUserBalance(ownerId);

	res.send({
		ok: true,
		data: { balance },
	});
}
