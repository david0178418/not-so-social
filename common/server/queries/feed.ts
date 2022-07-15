import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPointTransaction, DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { preparePostsForClient } from '.';
import { grammit } from '../server-utils';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

export
async function fetchFeed(type: keyof typeof Aggregations, userId: string, ...args: any[]) {
	const results = await Aggregations[type](userId, ...args);
	return preparePostsForClient(results, userId);
}

const Aggregations = {
	new: getNewPosts,
	top: getTopPosts,
	bookmarks: getBookmarkedPosts,
	myPosts: getMyPosts,
	hot: getHotPosts,
};

async function getNewPosts() {
	const col = await getCollection(DbCollections.Posts);

	return col.aggregate<DbPost>([{ $sort: { created: -1 } }]).toArray();
}

async function getTopPosts() {
	const col = await getCollection(DbCollections.Posts);

	return col.aggregate<DbPost>([
		{ $sort: { totalPoints: -1 } },
		// { $match: { created: { $gt: cutoffDate } } },
	]).toArray();
}

// TODO Clean this up
async function getBookmarkedPosts(userId: string, searchQuery?: string) {
	const col = await (searchQuery ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.PostBookmarks));

	const searchStages: any[] = [];

	if(searchQuery) {
		[
			{ $match: { $text: { $search: grammit(searchQuery) } } },
			{
				$lookup: {
					from: DbCollections.PostBookmarks,
					localField: 'postId',
					foreignField: 'postId',
					as: DocPlaceholder,
				},
			},
			{ $unwind: { path: `$${DocPlaceholder}` } },
			{ $replaceRoot: { newRoot: `$${DocPlaceholder}` } },
			{ $sort: { score: { $meta: 'textScore' } } },
		].forEach(x => searchStages.push(x));
	} else {
		searchStages.push({ $sort: { date: -1 } });

	}

	return col.aggregate<DbPost>([
		...searchStages,
		{ $match: { userId: new ObjectId(userId) } },
		{
			$lookup: {
				from: DbCollections.Posts,
				localField: 'postId',
				foreignField: '_id',
				as: DocPlaceholder,
			},
		},
		{ $unwind: { path: `$${DocPlaceholder}` } },
		{ $replaceRoot: { newRoot: `$${DocPlaceholder}` } },
	]).toArray();
}

// TODO Clean this up
async function getMyPosts(userId: string, searchQuery?: string) {
	const col = await (searchQuery ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.Posts));

	const searchStages: any[] = [];

	if(searchQuery) {
		[
			{ $match: { $text: { $search: grammit(searchQuery) } } },
			{
				$lookup: {
					from: DbCollections.Posts,
					localField: 'postId',
					foreignField: '_id',
					as: DocPlaceholder,
				},
			},
			{ $unwind: { path: `$${DocPlaceholder}` } },
			{ $replaceRoot: { newRoot: `$${DocPlaceholder}` } },
			{ $sort: { score: { $meta: 'textScore' } } },
		].forEach(x => searchStages.push(x));
	} else {
		searchStages.push({ $sort: { date: -1 } });
	}

	return col.aggregate<DbPost>([
		...searchStages,
		{ $match: { ownerId: new ObjectId(userId) } },
	]).toArray();
}

async function getHotPosts() {
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

	return col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();
}
