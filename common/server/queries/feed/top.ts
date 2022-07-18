import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections } from '@common/constants';
import { fetchRelatedPosts } from '..';
import { Feed } from '@common/types';

interface Params {
	userId?: string;
}

export
async function fetchTopPosts(params: Params): Promise<Feed> {
	const { userId } = params;
	const col = await getCollection(DbCollections.Posts);

	const results = await col.aggregate<DbPost>([
		{ $sort: { totalPoints: -1 } },
		// { $match: { created: { $gt: cutoffDate } } },
	]).toArray();

	return fetchRelatedPosts(results, userId);
}
