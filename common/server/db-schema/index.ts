import { Post } from '@common/types';
import { ObjectId } from 'mongodb';
import {
	SettingTypes,
	UserActivityTypes,
	UserRoles,
} from '@common/constants';

export * from './transactions-schema';

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

export
interface DbNotification {
	date: string;
	readOn?: string;
	message: string;
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
