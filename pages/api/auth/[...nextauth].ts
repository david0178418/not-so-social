import NextAuth from 'next-auth';
import { authOptions } from '@common/server/auth-options';

export default NextAuth(authOptions);
