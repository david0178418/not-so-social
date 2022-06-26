export
const AppName = 'BublUpper';

export
const MONGODB_DB = 'pinboard';

export
const MIN_POST_COST = 10;

export
const MAX_POST_COST = 1_00_000;

export
const OWN_POST_RATIO = 0.5;


export
enum Paths {
	Home = '/',
	Post = '/p',
	Bookmarks = '/bookmarks',
	UserBoosts = '/u/b',
	UserPosts = '/u/p',
	Profile = '/profile',
	Settings = '/settings',
}

export
const IS_SSR = typeof window === 'undefined';

export
const API_URL = '/api/v0';

export
const COOKIE_NAME = AppName;

export
const AUTH_USER_COOKIE_NAME = `${COOKIE_NAME}.AuthUser`;

export
const AUTH_USER_TOKENS_COOKIE_NAME = `${COOKIE_NAME}.AuthUserTokens`;

export
const IS_DEV = process.env.NODE_ENV !== 'production';

export
const MIN_POST_BODY_LENGTH = 10;

export
const MAX_POST_BODY_LENGTH = 500;

export
const MAX_POST_RESPONSE_LENGTH = 200;

export
const MIN_POST_TITLE_LENGTH = 6;

export
const MAX_POST_TITLE_LENGTH = 100;

export
const MIN_POST_POINTS = 10;

export
const MONGO_ID_LENGTH = 24;

export
const NOOP = () => {};

export
const POST_CREATE_POINT_RATIO = 0.5;

export
const NBSP = '\u00A0';

export
const DOT = '\u2022';

export
const NotLoggedInErrMsg = {
	ok: false,
	msg: 'Not logged in',
};

export
const BASE_REQ: RequestInit = {
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
	Creds = 'credentials',
	PostBookmarks = 'post-bookmarks',
	Posts = 'posts',
	PostEditHistory = 'post-edit-history',
	PointTransactions = 'point-transactions',
	UserActivity = 'user-activity',
	Users = 'users',
	UsersMeta = 'users-meta',
}

export
enum ModalActions {
	CreatePost = 'create-post',
	LoginRegister = 'login-register',
	Logout = 'logout',
}

export
enum PointTransactionTypes {
	postBoost = 'post-boost',
	userTransfer = 'user-transfer',
}

export
enum UserRoles {
	admin = 'admin',
	user = 'user'
}
