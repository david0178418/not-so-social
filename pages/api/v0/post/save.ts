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
		.required(),
	parentId: ObjectIdValidation.optional(),
});

export default
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const x: any = await getServerSession(req, res) || {};

	console.log('x', x);

	const { user } = x;

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
	points: number;
	parentId?: string;
}

async function createPost(content: PostContent, ownerId: string) {
	const postCol = await getCollection(DbCollections.Posts);
	const now = nowISOString();
	const {
		parentId,
		points: spentPoints,
		...newPostContent
	} = content;
	const ownerIdObj = new ObjectId(ownerId);
	const appliedPoints = Math.floor(OWN_POST_RATIO * spentPoints);

	const newPost: DbPost = {
		...newPostContent,
		created: now,
		lastUpdated: now,
		ownerId: ownerIdObj,
		points: appliedPoints,
	};

	if(parentId) {
		newPost.parentId = new ObjectId(parentId);
	}

	const result = await postCol.insertOne(newPost);

	await foo({
		from: ownerIdObj,
		spentPoints: spentPoints,
		appliedPoints: appliedPoints,
		postId: result.insertedId,
	});

	return result.insertedId;
}

interface FooArgs {
	appliedPoints: number;
	from: ObjectId;
	postId: ObjectId;
	spentPoints?: number;
}

export
async function foo(args: FooArgs) {
	const {
		appliedPoints,
		postId,
		from,
		spentPoints = appliedPoints,
	} = args;

	const postPointsCol = await getCollection(DbCollections.PostPointHistorys);
	const userCol = await getCollection(DbCollections.Users);

	await Promise.all([
		postPointsCol.insertOne({
			fromUserId: from,
			postId,
			points: appliedPoints,
		}),
		userCol.updateOne({ _id: from }, { $inc: { pointBalance: -spentPoints } }),
	]);
}
