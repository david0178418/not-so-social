import { DbCollections } from '@common/constants';
import { Post } from '@common/types';
import { ObjectId } from 'mongodb';
import { DbPost } from './db-schema';
import { getCollection } from './mongodb';
import { dbPostToPost } from './transforms';

export
async function getPosts(): Promise<Post[]> {
	const col = await getCollection<DbPost>(DbCollections.Posts);

	const results = await col
		.find()
		.toArray();

	return results.map(dbPostToPost);
}

export
async function getPost(id: string): Promise<Post | null> {
	try {
		const _id = new ObjectId(id);
		const col = await getCollection<DbPost>(DbCollections.Posts);

		const result = await col.findOne({ _id });

		return result && dbPostToPost(result);
	} catch {
		return null;
	}
}
