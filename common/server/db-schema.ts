import { UserActivityTypes } from '@common/constants';
import { Post } from '@common/types';
import { ObjectId } from 'mongodb';

type SavedPostProps = Pick<Post,
'body' |
'title' |
'created' |
'lastUpdated'
>;

export
interface DbPostPoints {
	points: number;
	postId: ObjectId;
	fromUserId: ObjectId;
}

export
interface DbPost extends SavedPostProps {
	_id?: ObjectId;
	ownerId: ObjectId;
	parentId?: ObjectId;
	points: number;
}

export
interface DbCreds {
	username: string;
	userId: ObjectId;
	hash: string;
}

export
interface DbBookmark {
	userId: string;
	postId: ObjectId;
}

export
interface DbUser {
	username: string;
	pointBalance: number;
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
