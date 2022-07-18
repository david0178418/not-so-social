import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import {
	DbCollections,
	PageSize,
} from '@common/constants';
import { preparePostsForClient } from '.';

export
async function fetchHotPosts(userId?: string) {
	const txnCol = await getCollection(DbCollections.PointTransactions);

	const txnAgg = await txnCol.aggregate<DbPointTransaction>([
		{ $sort: { date: -1 } },
	]);

	const pointRollup: Record<string, number> = {};

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
	}

	const postIds = Object.keys(pointRollup).sort((idA, idB) => pointRollup[idA] - pointRollup[idB]);

	const col = await getCollection(DbCollections.Posts);

	const results = await  col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();

	return preparePostsForClient(results, userId);
}
