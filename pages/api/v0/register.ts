import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import { DbCollections } from '@common/constants';
import { getCollection } from '@common/server/mongodb';
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
		return res.status(400).end();
	}

	try {
		const {
			username,
			password,
		} = await schema.validateAsync(req.body);
		await createUser(username, password);

		res.send({ ok: true });
	} catch(error: unknown) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: (error as ValidationError)
					.details
					.map(d => d.message),
			});
	}
}

async function createUser(username: string, password: string) {
	const usersCol = await getCollection(DbCollections.Users);
	const result = await usersCol.insertOne({ username });

	(await getCollection(DbCollections.UsersMeta))
		.insertOne({
			userId: result.insertedId,
			created: nowISOString(),
		});

	(await getCollection(DbCollections.Creds))
		.insertOne({
			username,
			userId: result.insertedId,
			hash: (await hash(password, 10)),
		});
}
