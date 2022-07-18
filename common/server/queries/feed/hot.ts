import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import { fetchRelatedPosts } from '..';
import { Feed } from '@common/types';
import {
	DbCollections,
	PageSize,
} from '@common/constants';

interface Params {
	userId?: string;
}

export
async function fetchHotPosts(params: Params): Promise<Feed> {
	const { userId } = params;
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

	return fetchRelatedPosts(results, userId);
}
