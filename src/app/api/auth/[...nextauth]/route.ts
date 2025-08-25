/*Comments to Build */

import NextAuth, { SessionStrategy, Account, Profile } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

export const authOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!
    })
  ],
  session: { strategy: 'jwt' as SessionStrategy },
  callbacks: {
  async jwt({ token, account, profile }: { token: Record<string, unknown>, account?: Account | null, profile?: Profile }) {
    if (account && profile && 'sub' in profile) {
      console.log('[NextAuth] JWT callback: Cognito profile received', profile);
      token.id = (profile as { sub: string }).sub;
      if ('username' in profile) token.username = (profile as { username?: string }).username;
      else if ('cognito:username' in profile) token.username = (profile as { 'cognito:username'?: string })['cognito:username'];
      console.log('[NextAuth] JWT callback: token set', token);
    }
    return token;
  },
  async session({ session, token }: { session: { user?: { name?: string | null; email?: string | null; image?: string | null; id?: string; username?: string }, expires?: string }, token: Record<string, unknown> }) {
    const newSession = {
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        username: token.username as string,
      },
      expires: typeof session.expires === 'string' ? session.expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
    console.log('[NextAuth] Session callback: session set', newSession);
    return newSession;
  }
  },
  pages: { signIn: '/api/auth/signin' }
};

const handler = NextAuth(authOptions as typeof authOptions);
export { handler as GET, handler as POST };
