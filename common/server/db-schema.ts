import { Post } from '@common/types';
import { ObjectId } from 'mongodb';
import {
	AwardTypes,
	PointTransactionTypes,
	SettingTypes,
	UserActivityTypes,
	UserRoles,
} from '@common/constants';

type SharedPostProps = Pick<Post,
'body' |
'title' |
'created' |
'lastUpdated' |
'linkPreviews' |
'totalPoints'
>;

export
interface DbSettings {
	type: SettingTypes;
	data: any;
}

export
interface DbPostTextGram {
	postId: ObjectId;
	grams: string;
}

export
interface DbPost extends SharedPostProps {
	_id?: ObjectId;
	ownerId: ObjectId;
	parentId?: ObjectId;
}

// export
// interface DbPointTransaction<T extends AwardTransactionMetadataTypes> {
// 	_id?: ObjectId;
// 	type: PointTransactionTypes;
// 	spentPoints?: number;
// 	appliedPoints: number;
// 	postId?: ObjectId;
// 	userId?: ObjectId;
// 	date: string;
// 	fromUserId?: ObjectId;
// 	data?: T;
// }

export
type DbPointTransaction = DbTxnProps & {
	_id?: ObjectId;
	appliedPoints: number;
	date: string;
}

type DbTxnProps = {
	type: PointTransactionTypes.Award;
	data: AwardTransactionMetadata;
} | {
	type: PointTransactionTypes.postBoost;
	userId?: ObjectId;
	spentPoints?: number;
	postId?: ObjectId;
	fromUserId?: ObjectId;
}

type AwardTransactionMetadata = {
	awardType: AwardTypes.Daily;
	streakSize: number; // 0 based.
	userId: ObjectId;
} | {
	awardType: AwardTypes.Signup;
	userId: ObjectId;
}

export
interface DbUser {
	_id?: ObjectId;
	role?: UserRoles;
	username: string;
	hash: string;
	pointBalance: number;
}

export
interface DbBookmark {
	userId: ObjectId;
	postId: ObjectId;
	date: string;
}

export
interface DbUserActivity {
	date: string;
	userId: ObjectId;
	type: UserActivityTypes;
	params?: any;
}

export
interface DbUserMeta {
	userId: ObjectId;
	created: string;
}
