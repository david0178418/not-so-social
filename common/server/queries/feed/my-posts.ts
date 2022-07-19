import type { DbPost } from '@common/server/db-schema';

import { ObjectId } from 'mongodb';
import { getCollection } from '@common/server/mongodb';
import { grammit } from '@common/server/server-utils';
import { DbCollections, PageSize } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

interface Params {
	userId?: string;
	searchTerm?: string;
	fromIndex?: number;
}

export
// TODO Clean this up
async function fetchMyPosts(params: Params): Promise<Feed> {
	const {
		userId,
		searchTerm,
		fromIndex = 0,
	} = params;

	if(!userId) {
		return {
			posts: [],
			parentPostMap: {},
			responsePostMap: {},
		};
	}

	const col = await (searchTerm ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.Posts));

	const searchStages: Record<string, any>[] = [];

	if(searchTerm) {
		[
			{ $match: { $text: { $search: grammit(searchTerm) } } },
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
		].forEach(i => searchStages.push(i));
	} else {
		searchStages.push({ $sort: { created: -1 } });
	}

	const results = await col.aggregate<DbPost>([
		...searchStages,
		{ $match: { ownerId: new ObjectId(userId) } },
		{ $limit: PageSize + fromIndex },
		{ $skip: fromIndex },
	]).toArray();

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
