import { Post } from '@common/types';
import { ObjectId } from 'mongodb';

export
interface DbPost extends Omit<Post, '_id' | 'ownerId'> {
	_id?: ObjectId;
	ownerId: ObjectId;
}

export
interface DbCreds {
	username: string;
	userId: string;
	pwHash: string;
}
