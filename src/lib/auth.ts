import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "user-login",
      name: "User Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter username and password");
        }

        const user = await db.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid username or password");
        }

        // Check if this is an admin trying to login through user login
        if (user.role === "admin") {
          throw new Error("Please use the admin login page");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid username or password");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter username and password");
        }

        const user = await db.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Only allow admins through admin login
        if (user.role !== "admin") {
          throw new Error("Access denied. Admin credentials required.");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;