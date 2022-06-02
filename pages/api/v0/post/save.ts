import type { NextApiRequest, NextApiResponse } from 'next';

import { DbCollections } from '@common/constants';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';
import Joi from 'joi';


interface Schema {
	body: string;
	title: string;
}

const schema = Joi.object<Schema>({
	body: Joi
		.string()
		.min(6)
		.max(2000)
		.required(),
	title: Joi
		.string()
		.min(3)
		.max(100)
		.required(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	if(!session) {
		return res
			.status(401)
			.end();
	}

	const {
		value,
		error,
	} = schema.validate(req.body);

	if(error) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: error
					.details
					.map(d => d.message),
			});
	}

	const {
		title,
		body,
	} = value;

	res.send({
		ok: true,
		data: { id: await createPost(title, body, session.user.id) },
	});
}

async function createPost(title: string, body: string, ownerId: string) {
	const postCol = await getCollection(DbCollections.Posts);
	const now = nowISOString();

	const result = await postCol.insertOne({
		title,
		body,
		created: now,
		lastUpdated: now,
		ownerId: new ObjectId(ownerId),
	});

	return result.insertedId;
}
