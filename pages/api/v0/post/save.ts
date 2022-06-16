import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { DbCollections } from '@common/constants';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';
import { ObjectIdValidation } from '@common/server/validations';

interface Schema {
	body: string;
	title: string;
	parentId?: string;
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
	parentId: ObjectIdValidation.optional(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	if(!session) {
		return res
			.status(401)
			.end();
	}

	try {
		const {
			title,
			body,
		} = await schema.validateAsync(req.body);

		res.send({
			ok: true,
			data: { id: await createPost(title, body, session.user.id) },
		});
	} catch(error: any) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: (error as ValidationError)
					.details
					.map((d: any) => d.message),
			});
	}
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
