import NextAuth from "next-auth"
import { DefaultSession } from "next-auth"
import { JWT as DefaultJwt } from "next-auth/jwt";
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      dailyLimit?: number | null
    } & DefaultSession["user"];
  }

  interface User {
    id: string
     dailyLimit?: number | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
        dailyLimit?: number | null;
    isValid?: boolean;
  }
}