import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { grammit } from '@common/server/server-utils';

const DocPlaceholder = 'docTemp';

export
async function fetchSearchFeed(userId: string, query = '') {
	if(!query) {
		return [];
	}

	const col = await getCollection(DbCollections.Grams);
	return col.aggregate<DbPost>([
		{ $match: { $text: { $search: grammit(query) } } },
		{ $sort: { score: { $meta: 'textScore' } } },
		{ $limit: PageSize },
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
