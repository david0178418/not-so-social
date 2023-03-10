import { Feed, Post } from '@common/types';
import { getCollection } from '@server/mongodb';
import { isTruthy, nowISOString } from '@common/utils';
import { fetchSettings } from './fetch-settings';
import { differenceInDays } from 'date-fns';
import { ObjectId } from 'mongodb';
import {
	AwardTypes,
	DbCollections,
	FeedTypes,
	PointTransactionTypes,
	UserActivityTypes,
} from '@common/constants';
import {
	DbUser,
	DbPost,
	DbUserActivity,
	DbPointTransaction,
	DbNotification,
} from '@server/db-schema';
import {
	dbPostToPostFn,
	postToBookmarkedPostFn,
	postListsToIdList,
	dbPointTransactionToPointTransaction,
} from '@server/transforms';
import {
	fetchBookmarkedPosts,
	fetchHotPosts,
	fetchMyPosts,
	fetchNewPosts,
	fetchSearchFeed,
	fetchTopPosts,
} from '@server/queries';

export { fetchRelatedPostsAndPrepareForClient } from './fetch-related-posts';
export { fetchBookmarkedPosts } from './feed/bookmarks.feed';
export { fetchHotPosts } from './feed/hot.feed';
export { fetchMyPosts } from './feed/my-posts.feed';
export { fetchNewPosts } from './feed/new.feed';
export { fetchSearchFeed } from './feed/search.feed';
export { fetchTopPosts } from './feed/top';

interface CommonFeedParams {
	userId?: string;
	searchTerm?: string;
	afterTimeISO?: string;
}

type FeedQuery = <T extends CommonFeedParams>(args: T) => Promise<Feed>;

export
const FeedTypeQueryMap: Record<FeedTypes, FeedQuery> = {
	[FeedTypes.Bookmarks]: fetchBookmarkedPosts,
	[FeedTypes.Hot]: fetchHotPosts,
	[FeedTypes.MyPosts]: fetchMyPosts,
	[FeedTypes.New]: fetchNewPosts,
	[FeedTypes.Search]: fetchSearchFeed,
	[FeedTypes.Top]: fetchTopPosts,
};

export
async function fetchPost(postId: string, userId = ''): Promise<Post | null> {
	const posts = await fetchPosts([postId], userId);
	return posts?.[0] || null;
}

export
async function fetchPosts(postIds: string[], userId = ''): Promise<Post[]> {
	const results = await fetchDbPosts(postIds);

	return results.map(dbPostToPostFn(userId));
}

export
async function fetchDbPost(postId: string): Promise<DbPost | null> {
	const col = await getCollection(DbCollections.Posts);
	return col.findOne<DbPost>({ _id: new ObjectId(postId) });
}

export
async function fetchDbPosts(postIds: string[]): Promise<DbPost[]> {
	if(!postIds.length) {
		return [];
	}

	const col = await getCollection(DbCollections.Posts);
	return col
		.find<DbPost>({ _id: { $in: postIds.map(i => new ObjectId(i)) } })
		.toArray();
}

export
async function fetchTopChildPosts(postIds: string[], userId?: string): Promise<Post[]> {
	const col = await getCollection(DbCollections.Posts);
	const postObjectIds = postIds.map(i => new ObjectId(i));
	const results = await col.aggregate<DbPost>([
		{ $match: { parentId: { $in: postObjectIds } } },
		{ $sort: { totalPoints: -1 } },
		{
			$group: {
				_id: '$parentId',
				post: { $first: '$$ROOT' },
			},
		},
		{ $replaceRoot: { newRoot: '$post' } },
	]).toArray();

	return results.map(dbPostToPostFn(userId));
}

async function fetchChildPosts(postId: string, userId: string): Promise<Post[]> {
	const col = await getCollection(DbCollections.Posts);
	const results = await col
		.find<DbPost>({ 'parent._id': new ObjectId(postId) })
		.sort({ totalPoints: -1 })
		.limit(100)	// TODO paging
		.toArray();

	return results.map(dbPostToPostFn(userId));
}

interface getFocusedPostProps {
	lv2Responses: Post[];
	post: Post | null;
	attachedToPosts: Post[];
	responses: Post[];
}

export
async function fetchFocusedPost(userId: string, id: string): Promise<getFocusedPostProps> {
	try {
		const post = await fetchPost(id, userId);

		if(!post) {
			return {
				attachedToPosts: [],
				post: null,
				responses: [],
				lv2Responses: [],
			};
		}

		const attachedPosts = await fetchPosts(post.attachedToPosts.map(p => p._id));

		const responses = await fetchChildPosts(id, userId);

		const allIds = postListsToIdList([post], responses, attachedPosts);

		const postToBookmarkedPost = postToBookmarkedPostFn(
			userId ?
				await fetchBookmarksFromPostIds(userId, allIds) :
				[]
		);

		const responseIds = responses.map(p => p._id).filter(isTruthy);
		const lv2Responses = await fetchTopChildPosts(responseIds, userId);

		return {
			attachedToPosts: attachedPosts.map(postToBookmarkedPost),
			lv2Responses,
			post: postToBookmarkedPost(post),
			responses: responses.map(postToBookmarkedPost),
		};
	} catch {
		return {
			attachedToPosts: [],
			lv2Responses: [],
			post: null,
			responses: [],
		};
	}
}

export
async function fetchPostTransactions(id: string) {
	const col = await getCollection(DbCollections.PointTransactions);

	const result = await col.find({
		type: PointTransactionTypes.postBoost,
		'data.postId': new ObjectId(id),
	}).toArray();

	return result.map(dbPointTransactionToPointTransaction);
}

export
async function fetchBookmarksFromPostIds(userId: string, postIds: string[]) {
	if(!postIds.length) {
		return [];
	}

	const col = await getCollection(DbCollections.PostBookmarks);
	return col.find({
		userId: new ObjectId(userId),
		postId: { $in: postIds.map(p => new ObjectId(p)) },
	}).toArray();
}

export
async function fetchUser(username: string): Promise<DbUser | null> {
	const usersCol = await getCollection(DbCollections.Users);
	const result = await usersCol.aggregate<DbUser>([
		{ $match: { $expr: { $eq: [ { $toLower: '$username' }, username.toLowerCase() ] } } },
		{ $limit: 1 },
	]).toArray();

	return result[0] || null;
}

export
async function recordActivity(userId: string, type: UserActivityTypes, params?: any) {
	const col = await getCollection(DbCollections.UserActivity);
	const record: DbUserActivity = {
		date: nowISOString(),
		userId: new ObjectId(userId),
		type,
	};

	if(params) {
		record.params = params;
	}

	await col.insertOne(record);
}

export
async function fetchUserBalance(userId: ObjectId) {
	const col = await getCollection(DbCollections.Users);

	const result = await col.findOne({ _id: userId });

	return result?.pointBalance || 0;
}

export
// TODO clean this up?
async function checkAwards(userId: string) {
	const settings = await fetchSettings();
	const txnCol = await getCollection(DbCollections.PointTransactions);
	const usersCol = await getCollection(DbCollections.Users);
	const result = await txnCol.aggregate<DbPointTransaction>([
		{
			$match: {
				'data.userId': new ObjectId(userId),
				type: PointTransactionTypes.Award,
			},
		},
		{ $sort: { date: -1 } },
		{ $limit: 1 },
	]).toArray();

	const lastAward = result?.[0] || null;
	const {
		awardDailyPointBase,
		awardDailyStreakIncrement,
		awardDailyStreakCap,
	} = settings;

	if(lastAward?.type !== PointTransactionTypes.Award) {
		return false;
	}

	const {
		date,
		data,
	} = lastAward;
	const lastAwardDate = new Date(date);
	const daysSinceLastAward = differenceInDays(new Date(), lastAwardDate);

	if(daysSinceLastAward < 1) {
		return false;
	}

	const notificationsCol = await getCollection(DbCollections.Notifications);

	const userIdObj = new ObjectId(userId);
	const nowDate = new Date();
	const nowIsoStr = nowDate.toISOString();
	let streakSize = 0;

	if(data.awardType === AwardTypes.Daily && daysSinceLastAward === 1) {
		streakSize = data.streakSize + 1;
	}

	const appliedPoints = awardDailyPointBase + (
		awardDailyStreakIncrement * Math.min(awardDailyStreakCap, streakSize)
	);

	const newAward: DbPointTransaction = {
		type: PointTransactionTypes.Award,
		points: appliedPoints,
		date: nowDate,
		data: {
			userId: userIdObj,
			awardType: AwardTypes.Daily,
			streakSize,
		},
	};

	const newNotification: DbNotification = {
		userId: userIdObj,
		date: nowIsoStr,
		message: `You've earned ${appliedPoints} for looking at cool stuff!`,
	};

	await Promise.all([
		usersCol.updateOne(
			{ _id: userIdObj },
			{ $inc: { pointBalance: appliedPoints } },
		),
		txnCol.insertOne(newAward),
		notificationsCol.insertOne(newNotification),
	]);
}
