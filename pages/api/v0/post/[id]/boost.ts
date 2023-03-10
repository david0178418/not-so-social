import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@server/auth-options';
import { DbPointTransaction } from '@server/db-schema';
import { getCollection } from '@server/mongodb';
import Joi, { ValidationError } from 'joi';
import { ObjectId } from 'mongodb';
import {
	DbCollections,
	NotLoggedInErrMsg,
	OwnPostRatio,
	PointTransactionTypes,
	UserRoles,
} from '@common/constants';
import { fetchUserBalance } from '@server/queries';

interface Schema {
	id: string;
	points: number;
}

const schema = Joi.object<Schema>({
	points: Joi
		.number()
		.integer()
		.required(),
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

		const ownerId = new ObjectId(user.id);
		const balance = await fetchUserBalance(ownerId);
		const isAdmin = user.role === UserRoles.Admin;

		if(
			!isAdmin &&
			points > balance
		) {
			return res.send({
				ok: false,
				errors: [
					`Not enough points. Current balance: ${balance}`,
				],
			});
		}

		await boostPost({
			postId: new ObjectId(postId),
			userId: new ObjectId(user.id),
			points,
			isAdmin,
		});

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

interface BoostPostProps {
	postId: ObjectId;
	userId: ObjectId;
	points: number;
	isAdmin?: boolean;
}

async function boostPost(props: BoostPostProps) {
	const {
		postId,
		userId,
		points,
		isAdmin = false,
	} = props;
	const date = new Date();
	const postCol = await getCollection(DbCollections.Posts);

	const post = await postCol.findOne({ _id: postId });

	if(!post) {
		return false;
	}

	const isOwner = post.ownerId.equals(userId);
	const appliedPoints = isOwner ? points * OwnPostRatio : points;
	const [
		usersCol,
		transactionCol,
	] = await Promise.all([
		getCollection(DbCollections.Users),
		getCollection(DbCollections.PointTransactions),
	]);

	const transaction: DbPointTransaction = {
		type: PointTransactionTypes.postBoost,
		points: appliedPoints,
		date,
		data: {
			userId: userId,
			postId,
			fromUserId: userId,
		},
	};

	const calls: Promise<any>[] = [
		postCol.updateOne(
			{ _id: postId },
			{ $inc: { totalPoints: appliedPoints } }
		),
	];

	if(isOwner) {
		transaction.data.spentPoints = points;
	} else {
		calls.push(
			usersCol.updateOne(
				{ _id: post.ownerId },
				{ $inc: { pointBalance: points } }
			)
		);
	}

	calls.push(transactionCol.insertOne(transaction));

	if(!isAdmin) {
		calls.push(
			usersCol.updateOne(
				{ _id: userId },
				{ $inc: { pointBalance: -points } }
			)
		);
	}

	await Promise.all(calls);
}
