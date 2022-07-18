import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections } from '@common/constants';
import { preparePostsForClient } from '.';

export
async function fetchTopPosts(userId?: string) {
	const col = await getCollection(DbCollections.Posts);

	const results = await col.aggregate<DbPost>([
		{ $sort: { totalPoints: -1 } },
		// { $match: { created: { $gt: cutoffDate } } },
	]).toArray();

	return preparePostsForClient(results, userId);
}
