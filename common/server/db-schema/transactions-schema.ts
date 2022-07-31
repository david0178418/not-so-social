import { ObjectId } from 'mongodb';
import {
	AwardTypes,
	PointTransactionTypes,
} from '@common/constants';

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
type DbPointTransaction = DbTxn & {
	_id?: ObjectId;
	points: number;
	date: Date;
}

type DbTxn = DbTxnAward | DbTxnPostBoost | DbTxnPostCreate;

type DbTxnPostBoost = {
	type: PointTransactionTypes.postBoost;
	data: {
		userId?: ObjectId;
		spentPoints?: number;
		postId?: ObjectId;
		fromUserId: ObjectId;
	};
}

type DbTxnPostCreate = {
	type: PointTransactionTypes.PostCreate;
	data: {
		userId: ObjectId;
		spentPoints: number;
		postId: ObjectId;
	}
};

type DbTxnAward = {
	type: PointTransactionTypes.Award;
	data: DbTxnAwardData;
}

type DbTxnAwardData = {
	awardType: AwardTypes.Daily;
	streakSize: number; // 0 based.
	userId: ObjectId;
} | {
	awardType: AwardTypes.Signup;
	userId: ObjectId;
}
