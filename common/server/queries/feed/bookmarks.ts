import { getCollection } from '@common/server/mongodb';
import { ObjectId } from 'mongodb';
import { DbPost } from '@common/server/db-schema';
import { grammit } from '@common/server/server-utils';
import { DbCollections } from '@common/constants';
import { preparePostsForClient } from '.';

// TODO Is there a better way to do this in MongoDB?
const DocPlaceholder = 'docTemp';

export
// TODO Clean this up
async function fetchBookmarkedPosts(userId: string, searchQuery?: string) {
	const col = await (searchQuery ?
		getCollection(DbCollections.Grams) :
		getCollection(DbCollections.PostBookmarks));

	const searchStages: any[] = [];

	if(searchQuery) {
		[
			{ $match: { $text: { $search: grammit(searchQuery) } } },
			{
				$lookup: {
					from: DbCollections.PostBookmarks,
					localField: 'postId',
					foreignField: 'postId',
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
		{ $match: { userId: new ObjectId(userId) } },
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
