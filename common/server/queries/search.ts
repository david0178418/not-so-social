import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { grammit } from '@common/server/server-utils';
import { preparePostsForClient } from '.';

const DocPlaceholder = 'docTemp';

export
async function fetchSearchFeed(query: string, userId: string) {
	const col = await getCollection(DbCollections.Grams);
	const results = await col.aggregate<DbPost>([
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

	return preparePostsForClient(results, userId);
}
