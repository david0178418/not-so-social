import { Post } from '@common/types';
import { ObjectId } from 'mongodb';

type SavedPostProps = Pick<Post,
'body' |
'title' |
'created' |
'lastUpdated'
>;

export
interface DbPost extends SavedPostProps {
	_id?: ObjectId;
	ownerId: ObjectId;
}

export
interface DbCreds {
	username: string;
	userId: string;
	pwHash: string;
}

export
interface DbBookmark {
	userId: string;
	postId: ObjectId;
}
