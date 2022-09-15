import { DbAttachmentPostPartial } from '@server/db-schema';
import { AttachmentPostPartial } from './types';
import { keys } from './utils';

export
const AppName = 'NotSo.Social (beta)';

export
const MongoDbName = 'pinboard';

export
const BaseUrl = 'https://notso.social';

export
const DefaultToastMsgDelay = 4000;

export
const MinPostCost = 10;

export
const MaxPostCost = 1_00_000;

export
const MaxPostAttachmentAnnotationLength = 200;

export
const OwnPostRatio = 0.5;

export
const UsernameMinLength = 3;

export
const UsernameMaxLength = 24;

export
const PasswordMinLength = 6;

export
const PasswordMaxLength = 128;

export
const PasswordSaltLength = 10;

export
const MaxSearchTermSize = 100;

export
const PageSize = 10;

export
const ISODateStringLength = 24;

export
enum Paths {
	Faq = '/faq',
	Bookmarks = '/bookmarks',
	Home = '/',
	HomeNew = '/new',
	HomeTop = '/top',
	Post = '/p',
	Profile = '/profile',
	ProfileBoosts = '/profile/boosts',
	ProfilePosts = '/profile/posts',
	Search = '/search',
	Settings = '/settings',
}

export
const HomePaths = [
	Paths.Home,
	Paths.HomeTop,
	Paths.HomeNew,
];

export
const ProfilePaths = [
	Paths.Profile,
	Paths.ProfileBoosts,
	Paths.ProfilePosts,
];

export
const IS_SSR = typeof window === 'undefined';

export
const API_URL = '/api/v0';

export
const CookieName = AppName;

export
const AuthUserCookieName = `${CookieName}.AuthUser`;

export
const AuthUser_tokensCookieName = `${CookieName}.AuthUserTokens`;

export
const IsDev = process.env.NODE_ENV !== 'production';

export
const MinPostBodyLength = 10;

export
const MaxPostBodyLength = 1000;

export
const MaxPostResponseLength = 200;

export
const MinPostTitleLength = 6;

export
const MaxPostTitleLength = 100;

export
const MinPostPoints = 10;

export
const MongoIdLength = 24;

export
const SpecialCharacterCodes = {
	NBSP: '\u00A0',
	DOT: '\u2022',
	QUOTE: '\u0022',
};

// TODO Wrap this in a utility function
const FullAttachmentPost: Required<AttachmentPostPartial> = {
	_id: '',
	body: '',
	created: '',
	lastUpdated: '',
	linkPreviews: [],
	nsfl: false,
	nsfw: false,
	title: '',
};

export
const AttachmentPostKeys = keys(FullAttachmentPost);

// TODO Wrap this in a utility function
const FullDbAttachmentPost: Required<DbAttachmentPostPartial> = {
	_id: null as any, // ObjectID can't be used client side. Need a better way to get these props
	body: '',
	created: '',
	lastUpdated: '',
	linkPreviews: [],
	nsfl: false,
	nsfw: false,
	title: '',
};

export
const DbAttachmentPostKeys = keys(FullDbAttachmentPost);

export
const NotLoggedInErrMsg = {
	ok: false,
	msg: 'Not logged in',
};

export
const BaseReq: RequestInit = {
	credentials: 'include',
	headers: {
		Accept: 'application/json, text/plain, */*',
		'Content-Type': 'application/json',
	},
};

export
enum UserActivityTypes {
	Navigate = 'navigate',
	BookmarkItem = 'bookmark-item',
}

export
enum DbCollections {
	AppMetadata = 'app-metadata',
	Grams = 'grams',
	Notifications = 'notifications',
	PointTransactions = 'point-transactions',
	PostBookmarks = 'post-bookmarks',
	PostEditHistory = 'post-edit-history',
	Posts = 'posts',
	UserActivity = 'user-activity',
	Users = 'users',
	UsersMeta = 'users-meta',
}

export
enum SettingTypes {
	AwardSettings ='award-settings',
}

export
enum AppSettings {
	AwardSignup = 'award-signup',
	AwardDailyPointBase = 'award-daily-point-base',
	AwardDailyStreakIncrement = 'award-daily-streak-increment',
	AwardDailyStreakCap = 'award-daily-streak-cap',
}

export
enum AwardTypes {
	Daily = 'daily',
	Signup = 'signup',
}

export
enum ModalActions {
	CreatePost = 'create-post',
	LoginRegister = 'login-register',
	Logout = 'logout',
}

export
enum PointTransactionTypes {
	Award = 'award',
	PostCreate = 'post-create',
	postBoost = 'post-boost',
	userTransfer = 'user-transfer',
}

export
enum FeedTypes {
	Bookmarks = 'bookmarks',
	Hot = 'hot',
	MyPosts = 'my-posts',
	New = 'new',
	Search = 'search',
	Top = 'top',
}

export
enum UserRoles {
	Admin = 'admin',
	User = 'user'
}

export
const ExtendedWhitespaceRegex = /\s{2,}/g;

export
// Source: https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
const PunctuationRegex = /[^\p{L}\s]/gu;
// Not sure if this should be used or the other const PunctuationRegex = /[.,-/#!$%^&*;:{}""=\-_`~()@+?><[\]+]/g;

export
// Source: https://99webtools.com/blog/list-of-english-stop-words/
const StopWords = [
	'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am',
	'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been',
	'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either',
	'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have',
	'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into',
	'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me',
	'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off',
	'often', 'on', 'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say',
	'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the',
	'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to',
	'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where',
	'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet',
	'you', 'your', 'ain\'t', 'aren\'t', 'can\'t', 'could\'ve', 'couldn\'t',
	'didn\'t', 'doesn\'t', 'don\'t', 'hasn\'t', 'he\'d', 'he\'ll', 'he\'s',
	'how\'d', 'how\'ll', 'how\'s', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'isn\'t',
	'it\'s', 'might\'ve', 'mightn\'t', 'must\'ve', 'mustn\'t', 'shan\'t',
	'she\'d', 'she\'ll', 'she\'s', 'should\'ve', 'shouldn\'t', 'that\'ll',
	'that\'s', 'there\'s', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
	'wasn\'t', 'we\'d', 'we\'ll', 'we\'re', 'weren\'t', 'what\'d', 'what\'s',
	'when\'d', 'when\'ll', 'when\'s', 'where\'d', 'where\'ll', 'where\'s',
	'who\'d', 'who\'ll', 'who\'s', 'why\'d', 'why\'ll', 'why\'s', 'won\'t',
	'would\'ve', 'wouldn\'t', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve',
];