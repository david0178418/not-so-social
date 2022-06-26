import { DbCollections, MONGODB_DB } from '@common/constants';
import {
	Collection,
	Db,
	MongoClient,
	MongoClientOptions,
} from 'mongodb';
import {
	DbBookmark,
	DbCreds,
	DbPost,
	DbPostPoints,
	DbUser,
	DbUserActivity,
	DbUserMeta,
} from './db-schema';

const uri = process.env.MONGODB_URI || '';
const options: MongoClientOptions = {};

let dbClient;
let dbClientPromise: Promise<Db>;

if (!process.env.MONGODB_URI) {
	throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	// @ts-ignore
	if (!global._mongoClientPromise) {
		dbClient = new MongoClient(uri, options);
		// @ts-ignore
		global._mongoClientPromise = dbClient.connect()
			.then((client) => client.db(MONGODB_DB));
	}
	// @ts-ignore
	dbClientPromise = global._mongoClientPromise;
} else {
	// In production mode, it's best to not use a global variable.
	dbClient = new MongoClient(uri, options);
	dbClientPromise = dbClient.connect()
		.then((client) => client.db(MONGODB_DB));
}

/* eslint-disable @typescript-eslint/indent */
type CollectionType<T> =
	T extends DbCollections.Creds ? DbCreds :
	T extends DbCollections.PostBookmarks ? DbBookmark :
	T extends DbCollections.PostPointHistorys ? DbPostPoints :
	T extends DbCollections.Posts ? DbPost :
	T extends DbCollections.Users ? DbUser :
	T extends DbCollections.UserActivity ? DbUserActivity :
	T extends DbCollections.UsersMeta ? DbUserMeta :
	never;
/* eslint-enable @typescript-eslint/indent */

async function getCollection<T extends DbCollections>(collection: T): Promise<Collection<CollectionType<T>>> {
	const db = await dbClientPromise;

	return db.collection<CollectionType<T>>(collection);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export {
	dbClientPromise,
	getCollection,
};
