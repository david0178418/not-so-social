import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections, PageSize } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

interface Params {
	userId?: string;
	afterTimeISO?: string;
}

export
async function fetchNewPosts(params: Params): Promise<Feed> {
	const {
		afterTimeISO,
		userId,
	} = params;

	const pipeline: Record<string, any>[] = [
		{ $sort: { created: -1 } },
	];

	if(afterTimeISO) {
		pipeline.push({ $match: { created: { $lt: afterTimeISO } } });
	}

	const col = await getCollection(DbCollections.Posts);
	const results = await col.aggregate<DbPost>([
		...pipeline,
		{ $limit: PageSize },
	]).toArray();

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
