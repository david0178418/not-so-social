import type { NextApiRequest, NextApiResponse } from 'next';

import { DbCollections } from '@common/constants';
import { dbClientPromise } from '@common/server/mongodb';
import { getSession } from 'next-auth/react';
import { nowISOString } from '@common/utils';
import { hash } from 'bcryptjs';
import Joi from 'joi';

interface Schema {
	password: string;
	username: string;
}

const schema = Joi.object<Schema>({
	username: Joi
		.string()
		.alphanum()
		.min(3)
		.max(20)
		.required(),
	password: Joi
		.string()
		.min(6)
		.max(50)
		.required(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	if(session) {
		res.status(400).end();
	} else {
		const {
			value,
			error,
		} = schema.validate(req.body);

		// const db = await dbClientPromise;
		// db.collection(DbCollections.Creds).findOne({user});

		if(error) {
			res.send({
				ok: false,
				errors: error
					.details
					.map(d => d.message),
			});
		} else {
			const {
				username,
				password,
			} = value;

			await createUser(username, password);

			res.send({ ok: true });
		}
	}
}

async function createUser(username: string, password: string) {
	const db = await dbClientPromise;

	const result = await db.collection(DbCollections.Users)
		.insertOne({ username });

	await db.collection(DbCollections.UsersMeta)
		.insertOne({
			userId: result.insertedId,
			created: nowISOString(),
		});

	await db.collection(DbCollections.Creds)
		.insertOne({
			username,
			userId: result.insertedId,
			hash: hash(password, 10),
		});
}
