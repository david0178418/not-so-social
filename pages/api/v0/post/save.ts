import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { ObjectId } from 'mongodb';
import { ObjectIdValidation } from '@common/server/validations';
import { DbPost } from '@common/server/db-schema';
import { getServerSession } from '@common/server/auth-options';
import {
	DbCollections,
	MAX_POST_COST,
	MIN_POST_COST,
	NotLoggedInErrMsg,
	OWN_POST_RATIO,
} from '@common/constants';
import { fetchUserBalance } from '@common/server/db-calls';

interface Schema {
	body: string;
	title: string;
	points: number;
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
	points: Joi
		.number()
		.min(MIN_POST_COST)
		.max(MAX_POST_COST)
		.required()
		.messages({ 'number.min': 'Must spend at least {#limit} points' }),
	parentId: ObjectIdValidation.optional(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	try {
		const postContent = await schema.validateAsync(req.body);
		const ownerId = new ObjectId(user.id);
		const balance = await fetchUserBalance(ownerId, postContent.points);

		if(postContent.points > balance) {
			return res.send({
				ok: false,
				errors: [`Not enough points. Current balance: ${balance}`],
			});
		}

		res.send({
			ok: true,
			data: { id: await createPost(postContent, ownerId) },
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
	points: number;
	parentId?: string;
}

async function createPost(content: PostContent, ownerId: ObjectId) {
	const postCol = await getCollection(DbCollections.Posts);
	const now = nowISOString();
	const {
		parentId,
		points: spentPoints,
		...newPostContent
	} = content;
	const appliedPoints = Math.floor(OWN_POST_RATIO * spentPoints);
	const newPostId = new ObjectId();
	const newPost: DbPost = {
		...newPostContent,
		created: now,
		lastUpdated: now,
		ownerId,
		points: appliedPoints,
		_id: newPostId,
	};

	if(parentId) {
		newPost.parentId = new ObjectId(parentId);
	}

	const [
		usersCol,
		pointPostCol,
	] = await Promise.all([
		getCollection(DbCollections.Users),
		getCollection(DbCollections.PostPointHistorys),
	]);

	await Promise.all([
		postCol.insertOne(newPost),
		pointPostCol
			.insertOne({
				fromUserId: ownerId,
				postId: newPostId,
				points: appliedPoints,
			}),
		usersCol
			.updateOne({ _id: ownerId }, { $inc: { pointBalance: -spentPoints } }),
	]);

	return newPostId;
}
