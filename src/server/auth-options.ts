import type {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next';

import { UserActivityTypes, UserRoles } from '@common/constants';
import { compare } from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
	NextAuthOptions,
	unstable_getServerSession,
} from 'next-auth';
import {
	checkAwards,
	fetchUser,
	recordActivity,
} from '@server/queries';

const {
	JWT_SECRET,
	NEXTAUTH_SECRET,
} = process.env;

type Req = GetServerSidePropsContext['req'] | NextApiRequest;
type Res = GetServerSidePropsContext['res'] | NextApiResponse;

export
async function getServerSession(req: Req, res: Res) {
	return unstable_getServerSession(req, res, authOptions);
}

export
const authOptions: NextAuthOptions = {
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
			async authorize(credentials) {
				if(!credentials) {
					return null;
				}

				const {
					username,
					password,
				} = credentials;

				const user = await fetchUser(username);

				if(!(user?._id && await compare(password, user.hash))) {
					return null;
				}

				return {
					id: user._id?.toString(),
					username: user.username,
					role: user.role || UserRoles.User,
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
		maxAge: 30 * 24 * 60 * 60, // 30 days

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
		// @ts-ignore TODO Figure out type error. Is this deprecated or is type wrong?
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
	// pages: {
	// signIn: '/auth/signin',  // Displays signin buttons
	// signOut: '/auth/signout', // Displays form with sign out button
	// error: '/auth/error', // Error code passed in query string as ?error=
	// verifyRequest: '/auth/verify-request', // Used for check email page
	// newUser: null, // If set, new users will be directed here on first sign in
	// },

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
				// @ts-ignore TODO again, figure out if type info is correct or not
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
	events: {
		// async signIn(message) { /* on successful sign in */ },
		// async signOut(message) { /* on signout */ },
		// async createUser(message) { /* user created */ },
		// async updateUser(message) { /* user updated - e.g. their email was verified */ },
		// async linkAccount(message) { /* account (e.g. Twitter) linked to a user */ },
		// async session(message) { /* session is active */ },

		// Don't know if "session" is or will be awaited in its usage. In the
		// even it is, implementing in a way as to record activity without
		// blocking the request.
		session(message: any) {
			const { session: { user: { id } } } = message;

			recordActivity(id, UserActivityTypes.Navigate)
				.then(() => checkAwards(id));
		},
	},

	// Enable debug messages in the console if you are having problems
	debug: false,
};
