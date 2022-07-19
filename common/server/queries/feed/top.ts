import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

interface Params {
	userId?: string;
	fromIndex?: number;
}

export
async function fetchTopPosts(params: Params): Promise<Feed> {
	const {
		userId,
		fromIndex = 0,
	} = params;
	const col = await getCollection(DbCollections.Posts);

	const results = await col.aggregate<DbPost>([
		{ $sort: { totalPoints: -1 } },
		{ $limit: PageSize + fromIndex },
		{ $skip: fromIndex },
	]).toArray();

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
