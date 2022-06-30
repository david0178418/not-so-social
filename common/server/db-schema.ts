import { Post } from '@common/types';
import { ObjectId } from 'mongodb';
import {
	PointTransactionTypes,
	UserActivityTypes,
	UserRoles,
} from '@common/constants';

type SavedPostProps = Pick<Post,
'body' |
'title' |
'created' |
'lastUpdated' |
'totalPoints'
>;

export
interface DbPointTransaction {
	type: PointTransactionTypes;
	spentPoints?: number;
	appliedPoints: number;
	toId: ObjectId;
	date: string;
	fromUserId: ObjectId;
}

export
interface DbPost extends SavedPostProps {
	_id?: ObjectId;
	ownerId: ObjectId;
	parentId?: ObjectId;
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
	userId: string;
	postId: ObjectId;
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
