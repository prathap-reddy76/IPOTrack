import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const admin = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth: session, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isLoginPage = request.nextUrl.pathname === '/admin/login';

      if (isAdminRoute && !isLoginPage && !session?.user) {
        return Response.redirect(new URL('/admin/login', request.nextUrl));
      }

      if (isLoginPage && session?.user) {
        return Response.redirect(new URL('/admin', request.nextUrl));
      }

      return true;
    },
  },
});
