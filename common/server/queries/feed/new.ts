import { getCollection } from '@common/server/mongodb';
import { DbPost } from '@common/server/db-schema';
import { DbCollections } from '@common/constants';

export
async function fetchNewPosts() {
	const col = await getCollection(DbCollections.Posts);

	return col.aggregate<DbPost>([{ $sort: { created: -1 } }]).toArray();
}
