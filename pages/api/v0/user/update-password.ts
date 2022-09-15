import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { getCollection } from '@server/mongodb';
import { getServerSession } from '@server/auth-options';
import { passwordToHash } from '@server/transforms';
import { ObjectId } from 'mongodb';
import {
	DbCollections,
	PasswordMaxLength,
	PasswordMinLength,
} from '@common/constants';

interface Schema {
	password: string;
}

const schema = Joi.object<Schema>({
	password: Joi
		.string()
		.min(PasswordMinLength)
		.max(PasswordMaxLength)
		.required(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getServerSession(req, res);

	if(!session?.user) {
		return res.status(401).end();
	}

	try {
		const { password } = await schema.validateAsync(req.body);

		await updatePassword(session.user.id, password);

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

async function updatePassword(userId: string, password: string) {
	const usersCol = await getCollection(DbCollections.Users);
	const hash = await passwordToHash(password);
	const _id = new ObjectId(userId);

	await usersCol.updateOne({ _id }, { $set: { hash } });
}
