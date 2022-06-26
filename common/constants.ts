export
const AppName = 'BublUpper';

export
const MongoDbName = 'pinboard';

export
const MinPostCost = 10;

export
const MaxPostCost = 1_00_000;

export
const OwnPostRatio = 0.5;


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
const MaxPostBodyLength = 500;

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
const PostCreatePointRatio = 0.5;

export
const UnicodeChars = {
	NBSP: '\u00A0',
	DOT: '\u2022',
};

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
