import NextAuth , {type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { prisma } from "@/lib/db"
import {prisma} from "./db"

// const prisma = new PrismaClient()

export const authOptions : NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
   session: {
    strategy: "jwt", // Critical for performance (doesn't hit DB on every page load)
    maxAge : 1*24*60*60
  },
  jwt : {
    maxAge : 1*24*60*60
  },
  callbacks: {
    // Add the User ID to the session so you can identify them in the frontend
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.dailyLimit = user.dailyLimit; 
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
         session.user.dailyLimit = token.dailyLimit as number;
      }
      return session
    },
  },
  pages: {
    signIn: "/login", // Use our custom static pages
  },
   secret: process.env.NEXTAUTH_SECRET, // Don't forget this!
}

// export default NextAuth(authOptions)
