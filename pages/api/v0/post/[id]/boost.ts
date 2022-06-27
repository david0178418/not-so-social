import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@common/server/auth-options';
import { DbPointTransaction } from '@common/server/db-schema';
import { getCollection } from '@common/server/mongodb';
import { nowISOString } from '@common/utils';
import Joi, { ValidationError } from 'joi';
import { ObjectId } from 'mongodb';
import {
	DbCollections,
	NotLoggedInErrMsg,
	PointTransactionTypes,
	PostCreatePointRatio,
} from '@common/constants';

interface Schema {
	id: string;
	points: number;
}

const schema = Joi.object<Schema>({
	points: Joi.number(),
	id: Joi
		.string()
		.length(24)
		.required(),
});


export default
async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const {
			points,
			id: postId,
		} = await schema.validateAsync({
			...req.body,
			...req.query,
		});

		const { user } = await getServerSession(req, res) || {};

		if(!user) {
			return res.status(401).send(NotLoggedInErrMsg);
		}

		await boostPost(new ObjectId(postId), new ObjectId(user.id), points);

		return res
			.status(200)
			.json({ ok: true });
	} catch (error) {
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

async function boostPost(postId: ObjectId, userId: ObjectId, points: number) {
	const date = nowISOString();
	const postCol = await getCollection(DbCollections.Posts);

	const post = await postCol.findOne({ _id: postId });

	if(!post) {
		return false;
	}

	const isOwner = post.ownerId.equals(userId);
	const appliedPoints = isOwner ? points * PostCreatePointRatio : points;
	const [
		usersCol,
		transactionCol,
	] = await Promise.all([
		getCollection(DbCollections.Users),
		getCollection(DbCollections.PointTransactions),
	]);

	const transaction: DbPointTransaction = {
		type: PointTransactionTypes.postBoost,
		appliedPoints,
		toId: postId,
		date,
		fromUserId: userId,
	};

	if(isOwner) {
		transaction.spentPoints = points;
	}

	await Promise.all([
		transactionCol.insertOne(transaction),
		postCol.updateOne(
			{ _id: postId },
			{ $inc: { points: appliedPoints } }
		),
		usersCol.updateOne(
			{ _id: userId },
			{ $inc: { pointBalance: -points } }
		),
	]);
}
