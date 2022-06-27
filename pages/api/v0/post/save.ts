import type { ValidationError } from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next';

import Joi from 'joi';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import { ObjectId } from 'mongodb';
import { ObjectIdValidation } from '@common/server/validations';
import { DbPost } from '@common/server/db-schema';
import { getServerSession } from '@common/server/auth-options';
import { fetchUserBalance } from '@common/server/db-calls';
import {
	DbCollections,
	MaxPostCost,
	MinPostCost,
	NotLoggedInErrMsg,
	OwnPostRatio,
	PointTransactionTypes,
	UserRoles,
} from '@common/constants';

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
		.max(150)
		.required(),
	points: Joi
		.number()
		.min(MinPostCost)
		.max(MaxPostCost)
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
		const balance = await fetchUserBalance(ownerId);
		const isAdmin = user.role === UserRoles.admin;

		if(
			!isAdmin &&
			postContent.points > balance
		) {
			return res.send({
				ok: false,
				errors: [
					`Not enough points. Current balance: ${balance}`,
				],
			});
		}

		res.send({
			ok: true,
			data: { id: await createPost(postContent, ownerId, isAdmin) },
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

async function createPost(content: PostContent, ownerId: ObjectId, isAdmin = false) {
	const postCol = await getCollection(DbCollections.Posts);
	const now = nowISOString();
	const {
		parentId,
		points: spentPoints,
		...newPostContent
	} = content;
	const appliedPoints = Math.floor(OwnPostRatio * spentPoints);
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
		getCollection(DbCollections.PointTransactions),
	]);

	const calls: Promise<any>[] = [
		postCol.insertOne(newPost),
		pointPostCol
			.insertOne({
				type: PointTransactionTypes.postBoost,
				fromUserId: ownerId,
				toId: newPostId,
				date: now,
				appliedPoints,
				spentPoints,
			}),
	];

	if(!isAdmin) {
		calls.push(
			usersCol
				.updateOne({ _id: ownerId }, { $inc: { pointBalance: -spentPoints } })
		);
	}

	await Promise.all(calls);

	return newPostId;
}
