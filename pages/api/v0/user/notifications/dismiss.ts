import type { NextApiRequest, NextApiResponse } from 'next';

import { DbCollections, NotLoggedInErrMsg } from '@common/constants';
import { getServerSession } from '@server/auth-options';
import { ObjectId } from 'mongodb';
import { MongoObjectId } from '@server/validations';
import { z } from 'zod';
import { getCollection } from '@server/mongodb';
import { nowISOString } from '@common/utils';

const schema = z.object({ id: MongoObjectId });

export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	const result = await schema.safeParseAsync(req.query);

	if(!result.success) {
		console.log(result.error);
		return res
			.status(400)
			.send({ ok: false });
	}

	const { id } = result.data;

	await dismissNotifications(id, user.id);

	res.send({ ok: true });
}

async function dismissNotifications(id: string, ownerId: string) {
	const col = await getCollection(DbCollections.Notifications);

	col.updateOne({
		_id: new ObjectId(id),
		userId: new ObjectId(ownerId),
	}, { $set: { readOn: nowISOString() } });
}
