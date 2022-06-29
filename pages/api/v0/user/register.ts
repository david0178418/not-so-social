import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { getServerSession } from '@common/server/auth-options';
import { fetchUser } from '@common/server/db-calls';
import { passwordToHash } from '@common/server/transforms';
import {
	DbCollections,
	PasswordMaxLength,
	PasswordMinLength,
	UsernameMaxLength,
	UsernameMinLength,
} from '@common/constants';

interface Schema {
	password: string;
	username: string;
}

const schema = Joi.object<Schema>({
	username: Joi
		.string()
		.alphanum()
		.min(UsernameMinLength)
		.max(UsernameMaxLength)
		.required(),
	password: Joi
		.string()
		.min(PasswordMinLength)
		.max(PasswordMaxLength)
		.required(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getServerSession(req, res);

	if(session) {
		return res.status(400).end();
	}

	try {
		const {
			username,
			password,
		} = await schema.validateAsync(req.body);

		if(await fetchUser(username)) {
			return res.send({
				ok: false,
				errors: [
					`User "${username}" already exists`,
				],
			});
		}

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
	const hash = await passwordToHash(password);

	const result = await usersCol
		.insertOne({
			username,
			pointBalance: 0,
			hash,
		});

	(await getCollection(DbCollections.UsersMeta))
		.insertOne({
			userId: result.insertedId,
			created: nowISOString(),
		});

}
