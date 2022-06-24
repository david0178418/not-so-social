import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { DbCollections, NotLoggedInErrMsg } from '@common/constants';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';
import { ObjectIdValidation } from '@common/server/validations';
import { DbPost } from '@common/server/db-schema';

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
	const { user } = await getSession({ req }) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	try {
		const postContent = await schema.validateAsync(req.body);

		res.send({
			ok: true,
			data: { id: await createPost(postContent, user.id) },
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

interface PostContent {
	title: string;
	body: string;
	parentId?: string;
}

async function createPost(content: PostContent, ownerId: string) {
	const postCol = await getCollection(DbCollections.Posts);
	const now = nowISOString();
	const {
		parentId,
		...newPostContent
	} = content;

	const newPost: DbPost = {
		...newPostContent,
		created: now,
		lastUpdated: now,
		ownerId: new ObjectId(ownerId),
		points: 0,
	};

	if(parentId) {
		newPost.parentId = new ObjectId(parentId);
	}

	const result = await postCol.insertOne(newPost);

	return result.insertedId;
}
