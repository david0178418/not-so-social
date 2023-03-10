import type { Feed } from '@common/types';
import type { DbPost } from '@server/db-schema';

import { ObjectId } from 'mongodb';
import { getCollection } from '@server/mongodb';
import { grammit } from '@server/server-utils';
import { DbCollections, PageSize } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

interface Params {
	userId?: string;
	searchTerm?: string;
	fromIndex?: number;
}

export
// TODO Clean this up
async function fetchBookmarkedPosts(params: Params): Promise<Feed> {
	const {
		userId,
		searchTerm,
		fromIndex = 0,
	} = params;

	if(!userId) {
		return {
			posts: [],
			responsePostMap: {},
		};
	}

	const col = await (searchTerm ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.PostBookmarks));

	const searchStages: Record<string, any>[] = [];

	if(searchTerm) {
		[
			{ $match: { $text: { $search: grammit(searchTerm) } } },
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

	const results = await col.aggregate<DbPost>([
		...searchStages,
		{ $match: { userId: new ObjectId(userId) } },
		{ $limit: PageSize + fromIndex },
		{ $skip: fromIndex },
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

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
