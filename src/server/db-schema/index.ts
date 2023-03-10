import { ObjectId } from 'mongodb';
import {
	SettingTypes,
	UserActivityTypes,
	UserRoles,
} from '@common/constants';

export * from './transactions-schema';

export
type DbAttachmentPostPartial = { _id: ObjectId } & Pick<DbPost,
'body' |
'title' |
'created' |
'lastUpdated' |
'nsfw' |
'nsfl'
>;

export
interface DbVideoLinkPreviewData {
	url?: string;
	secureUrl?: string | null;
	type?: string | null;
	width?: string;
	height?: string;
}

export
interface DbExternalLinkPreviewData {
	url: string;
	title: string;
	siteName?: string;
	description?: string;
	mediaType?: string;
	contentType?: string;
	images: string[];
	videos: DbVideoLinkPreviewData[];
	favicons: string[];
}

// TODO Clean up this type mess
export
interface DbPostLinkPreviewType {
	type: 'post',
	post: DbAttachmentPostPartial;
}

export
interface DbExternalLinkPreviewType {
	type: 'link';
	link: DbExternalLinkPreviewData;
}

// Todo clean this up. Probably make "data" general
export
interface DbEmbedLinkPreviewType {
	type: 'embed';
	data: {
		source: 'twitter';
		id: string;
	};
}

type DbLinkPreviewType = DbPostLinkPreviewType | DbExternalLinkPreviewType | DbEmbedLinkPreviewType;

export
type DbLinkPreview = DbLinkPreviewType & {
	annotation?: string,
}

export
type DbParentPostPartial = Pick<DbPost,
'_id' |
'created' |
'lastUpdated' |
'nsfl' |
'nsfw' |
'ownerId' |
'title'
>;

export
interface DbPost {
	_id?: ObjectId;
	attachedToPosts?: DbParentPostPartial[];
	body: string;
	created: string;
	lastUpdated: string;
	linkPreviews?: DbLinkPreview[];
	nsfl?: boolean;
	nsfw?: boolean;
	ownerId: ObjectId;
	parent?: DbParentPostPartial;
	replyCount: number;
	title: string;
	totalPoints: number;
}

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
interface DbNotification {
	date: string;
	message: string;
	readOn?: string | null;
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
