import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';
import {
	DbCollections,
	PageSize,
	PointTransactionTypes,
} from '@common/constants';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

const HotTxnTypes = [
	PointTransactionTypes.PostCreate,
	PointTransactionTypes.postBoost,
];

interface Params {
	userId?: string;
	fromIndex?: number;
}

export
// TODO Rethink what "hot" means
async function fetchHotPosts(params: Params): Promise<Feed> {
	const {
		fromIndex = 0,
		userId,
	} = params;
	const col = await getCollection(DbCollections.PointTransactions);

	const results = await col.aggregate<DbPost>([
		{ $match: { type: { $in: HotTxnTypes } } },
		{ $sort: { date: -1 } },
		{ $limit: 1000 },
		{
			$set: {
				hourDiff: {
					$dateDiff: {
						startDate: '$date',
						endDate: new Date(),
						unit: 'day',
					},
				},
			},
		},
		{
			$set: {
				weight: {
					$cond: [
						{ $eq: [ '$hourDiff', 0 ] },
						1,
						{
							$divide: [
								1,
								'$hourDiff',
							],
						},
					],
				},
			},
		},
		{
			$set: {
				weightedPoints: {
					$multiply: [
						'$weight',
						'$points',
					],
				},
			},
		},
		{
			$group: {
				_id: '$data.postId',
				points: { $sum: '$weightedPoints' },
			},
		},
		{ $sort: { points: -1 } },
		{ $limit: PageSize + fromIndex },
		{ $skip: fromIndex },
		{
			$lookup: {
				from: DbCollections.Posts,
				localField: '_id',
				foreignField: '_id',
				as: DocPlaceholder,
			},
		},
		{ $unwind: { path: `$${DocPlaceholder}` } },
		{ $replaceRoot: { newRoot: `$${DocPlaceholder}` } },
	]).toArray();

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
