import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

interface Params {
	userId?: string;
	afterTime?: string;
}

export
async function fetchNewPosts(params: Params): Promise<Feed> {
	const { userId } = params;
	const col = await getCollection(DbCollections.Posts);

	const results = await col.aggregate<DbPost>([{ $sort: { created: -1 } }]).toArray();

	const feedPosts = await fetchRelatedPostsAndPrepareForClient(results, userId);

	return {
		...feedPosts,
		cutoffISO: '',
	};
}
