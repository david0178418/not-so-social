import { DbCollections } from '@common/constants';
import { Post } from '@common/types';
import { DbPost } from './db-schema';
import { getCollection } from './mongodb';

export
async function getPosts(): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);

	const results = await col
		.find()
		.toArray();

	return results.map(p => ({
		...p,
		_id: p._id?.toString(),
		ownerId: p.ownerId.toString(),
	}));
}
