import { getCollection } from '@common/server/mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';
import { ObjectId } from 'mongodb';
import {
	DbCollections,
	PageSize,
} from '@common/constants';

interface Params {
	userId?: string;
	afterTimeISO?: string;
}

export
// TODO Rethink what "hot" means
async function fetchHotPosts(params: Params): Promise<Feed> {
	const {
		afterTimeISO,
		userId,
	} = params;
	const txnCol = await getCollection(DbCollections.PointTransactions);

	const pipeline: Record<string, any>[] = [
		{ $sort: { date: -1 } },
	];

	if(afterTimeISO) {
		const foo = await txnCol.aggregate<DbPointTransaction>([
			{ $match: { date: { $gte: afterTimeISO } } },
			{ $group: { _id: '$postId' } },
		]).toArray();

		pipeline.push(
			{
				$match: {
					$and: [
						{ date: { $lt: afterTimeISO } },
						{ postId: { $nin: foo.map(f => f._id) } },
					],
				},
			},
		);
	}

	const txnAgg = await txnCol.aggregate<DbPointTransaction>(pipeline);

	const pointRollup: Record<string, number> = {};
	let cutoffISO = '';

	while(await txnAgg.hasNext()) {
		const doc = await txnAgg.next();

		if(!doc?.postId) {
			continue;
		}

		const postId = doc.postId.toString();

		if(!pointRollup[postId]) {
			if(Object.keys(pointRollup).length === PageSize) {
				break;
			}

			pointRollup[postId] = 0;
		}

		pointRollup[postId] = pointRollup[postId] + doc.appliedPoints;
		cutoffISO = doc.date.toString();
	}

	const postIds = Object.keys(pointRollup).sort((idA, idB) => pointRollup[idA] - pointRollup[idB]);

	const col = await getCollection(DbCollections.Posts);

	const results = await col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();

	const feedPosts = await fetchRelatedPostsAndPrepareForClient(results, userId);

	return {
		...feedPosts,
		cutoffISO,
	};
}
