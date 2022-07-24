import { getCollection } from '@common/server/mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';
import { ObjectId } from 'mongodb';
import {
	DbCollections,
	PageSize,
	PointTransactionTypes,
} from '@common/constants';

const HotTypeTxns = [
	PointTransactionTypes.postBoost,
	PointTransactionTypes.postBoost,
];

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
			{
				$match: {
					date: { $gte: afterTimeISO },
					type: { $in: HotTypeTxns },
				},
			},
			{ $group: { _id: '$data.postId' } },
		]).toArray();

		pipeline.push(
			{
				$match: {
					$and: [
						{ date: { $lt: afterTimeISO } },
						{ 'data.postId': { $nin: foo.map(f => f._id) } },
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

		if(!((
			doc?.type === PointTransactionTypes.postBoost ||
			doc?.type === PointTransactionTypes.PostCreate
		) && doc.data.postId)) {
			continue;
		}

		const postId = doc.data.postId.toString();

		if(!pointRollup[postId]) {
			if(Object.keys(pointRollup).length === PageSize) {
				break;
			}

			pointRollup[postId] = 0;
		}

		pointRollup[postId] = pointRollup[postId] + doc.points;
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
