import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { grammit } from '@common/server/server-utils';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

const DocPlaceholder = 'docTemp';

interface Params {
	userId?: string;
	searchTerm?: string;
	fromIndex?: number;
}

export
async function fetchSearchFeed(params: Params): Promise<Feed> {
	const {
		userId,
		searchTerm,
		fromIndex = 0,
	} = params;

	if(!searchTerm) {
		return {
			posts: [],
			parentPostMap: {},
			responsePostMap: {},
		};
	}

	const col = await getCollection(DbCollections.Grams);

	const results = await col.aggregate<DbPost>([
		{ $match: { $text: { $search: grammit(searchTerm) } } },
		{ $sort: { score: { $meta: 'textScore' } } },
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
