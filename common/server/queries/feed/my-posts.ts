import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPost } from '@common/server/db-schema';
import { grammit } from '@common/server/server-utils';
import { DbCollections } from '@common/constants';
import { fetchRelatedPostsAndPrepareForClient } from '..';
import { Feed } from '@common/types';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

interface Params {
	userId?: string;
	searchQuery?: string;
	afterTime?: string;
}

export
// TODO Clean this up
async function fetchMyPosts(params: Params): Promise<Feed> {
	const {
		userId,
		searchQuery,
	} = params;

	if(!userId) {
		return {
			cutoffISO: '',
			posts: [],
			parentPostMap: {},
			responsePostMap: {},
		};
	}

	const col = await (searchQuery ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.Posts));

	const searchStages: any[] = [];

	if(searchQuery) {
		[
			{ $match: { $text: { $search: grammit(searchQuery) } } },
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
			{ $sort: { score: { $meta: 'textScore' } } },
		].forEach(x => searchStages.push(x));
	} else {
		searchStages.push({ $sort: { date: -1 } });
	}

	const results = await col.aggregate<DbPost>([
		...searchStages,
		{ $match: { ownerId: new ObjectId(userId) } },
	]).toArray();

	return fetchRelatedPostsAndPrepareForClient(results, userId);
}
