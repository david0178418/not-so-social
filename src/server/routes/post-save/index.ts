import type { NextApiRequest, NextApiResponse } from 'next';

import { ObjectId } from 'mongodb';
import { getServerSession } from '@server/auth-options';
import { fetchUserBalance } from '@server/queries';
import { PostSaveValidation } from './post-save.validation';
import { createPost } from './create-post';
import {
	NotLoggedInErrMsg,
	UserRoles,
} from '@common/constants';

export
async function postSaveHandler(req: NextApiRequest, res: NextApiResponse<any>) {
	const { user } = await getServerSession(req, res) || {};

	if(!user) {
		return res.status(401).send(NotLoggedInErrMsg);
	}

	const result = await PostSaveValidation.safeParseAsync(req.body);

	if(!result.success) {
		return res
			.status(400)
			.send({
				ok: false,
				errors: result.error.errors.map(e => e.message),
			});
	}

	const postContent = result.data;
	const ownerId = new ObjectId(user.id);
	const balance = await fetchUserBalance(ownerId);
	const isAdmin = user.role === UserRoles.Admin;

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
}
