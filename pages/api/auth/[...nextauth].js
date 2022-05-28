import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DbCollections } from '@common/constants';
import { dbClientPromise } from '../../../common/server/mongodb';
import { compare } from 'bcryptjs';

const {
	JWT_SECRET,
	NEXTAUTH_SECRET,
} = process.env;

export default NextAuth({
	// https://next-auth.js.org/configuration/providers
	providers: [
		CredentialsProvider({
			name: 'Username',
			// The credentials is used to generate a suitable form on the sign in page.
			// You can specify whatever fields you are expecting to be submitted.
			// e.g. domain, username, password, 2FA token, etc.
			// You can pass any HTML attribute to the <input> tag through the object.
			credentials: {
				username: {
					label: 'Username or Email',
					type: 'text',
					placeholder: 'pinner',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
			},
			async authorize(cred) {
				const {
					username,
					password,
				} = cred;

				const db = await dbClientPromise;

				const u = await db.collection(DbCollections.Creds)
					.findOne({ username });

				if(!(u && await compare(password, u.hash))) {
					return null;
				}

				return {
					id: u._id,
					username,
				};
			},
		}),
		// EmailProvider({
		//   server: process.env.EMAIL_SERVER,
		//   from: process.env.EMAIL_FROM,
		// }),
		// AppleProvider({
		//   clientId: process.env.APPLE_ID,
		//   clientSecret: {
		//     appleId: process.env.APPLE_ID,
		//     teamId: process.env.APPLE_TEAM_ID,
		//     privateKey: process.env.APPLE_PRIVATE_KEY,
		//     keyId: process.env.APPLE_KEY_ID,
		//   },
		// }),
		// TwitterProvider({
		// 	clientId: process.env.TWITTER_ID,
		// 	clientSecret: process.env.TWITTER_SECRET,
		// }),
	],
	// Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
	// https://next-auth.js.org/configuration/databases
	//
	// Notes:
	// * You must install an appropriate node_module for your database
	// * The Email provider requires a database (OAuth providers do not)
	// database: process.env.DATABASE_URL,

	// The secret should be set to a reasonably long random string.
	// It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
	// a separate secret is defined explicitly for encrypting the JWT.
	secret: NEXTAUTH_SECRET,

	session: {
		// Use JSON Web Tokens for session instead of database sessions.
		// This option can be used with or without a database for users/accounts.
		// Note: `strategy` should be set to 'jwt' if no database is used.
		strategy: 'jwt',

		// Seconds - How long until an idle session expires and is no longer valid.
		// maxAge: 30 * 24 * 60 * 60, // 30 days

		// Seconds - Throttle how frequently to write to database to extend a session.
		// Use it to limit write operations. Set to 0 to always update the database.
		// Note: This option is ignored if using JSON Web Tokens
		// updateAge: 24 * 60 * 60, // 24 hours
	},

	// JSON Web tokens are only used for sessions if the `strategy: 'jwt'` session
	// option is set - or by default if no database is specified.
	// https://next-auth.js.org/configuration/options#jwt
	jwt: {
		// A secret to use for key generation (you should set this explicitly)
		secret: JWT_SECRET,
		// Set to true to use encryption (default: false)
		encryption: true,
		// You can define your own encode/decode functions for signing and encryption
		// if you want to override the default behaviour.
		// encode: async ({ secret, token, maxAge }) => {},
		// decode: async ({ secret, token, maxAge }) => {},
	},

	// You can define custom pages to override the built-in ones. These will be regular Next.js pages
	// so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
	// The routes shown here are the default URLs that will be used when a custom
	// pages is not specified for that route.
	// https://next-auth.js.org/configuration/pages
	pages: {
		// signIn: '/auth/signin',  // Displays signin buttons
		// signOut: '/auth/signout', // Displays form with sign out button
		// error: '/auth/error', // Error code passed in query string as ?error=
		// verifyRequest: '/auth/verify-request', // Used for check email page
		newUser: null, // If set, new users will be directed here on first sign in
	},

	// Callbacks are asynchronous functions you can use to control what happens
	// when an action is performed.
	// https://next-auth.js.org/configuration/callbacks
	callbacks: {
		// async signIn({ user, account, profile, email, credentials }) { return true },
		// async redirect({ url, baseUrl }) { return baseUrl },
		// async session({ session, token, user }) { return session },
		async jwt(args) {
			const {
				token,
				user,
				// account,
				// profile,
				// isNewUser,
			} = args;

			if(user) {
				token.user = user;
			}

			return token;
		},
		async session(args) {
			const {
				session,
				token,
			} = args;

			session.user = token.user;

			return session;
		},
	},

	// Events are useful for logging
	// https://next-auth.js.org/configuration/events
	events: {},

	// Enable debug messages in the console if you are having problems
	debug: false,
});