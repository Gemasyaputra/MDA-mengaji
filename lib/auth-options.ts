import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For CredentialsProvider, we return 'true' if authorize succeeds.
      // We only do custom Google validation here since authorize() handles credentials fully.
      if (account?.provider === "google") {
        if (!user.email) return false;

        try {
          // Check if user exists in the database
          const existingUser = await db
            .select({
              id: users.id,
              isVerified: users.isVerified
            })
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (existingUser.length > 0) {
            const dbUser = existingUser[0];

            // Check if email is verified
            if (!dbUser.isVerified) {
              return "/?error=UnverifiedEmail";
            }

            // User exists and verified
            return true;
          } else {
            // User does not exist in DB, deny login
            return "/?error=UserNotFound";
          }
        } catch (error) {
          console.error("Error checking user in database:", error);
          return false;
        }
      }
      return true; // Used by Credentials
    },
    async jwt({ token, user, account }) {
      // When user signs in, attach extra info from DB to token
      if (user && user.email) {
         try {
            const dbUser = await db
              .select({
                id: users.id,
                name: users.name, // Fetch name from our DB
                role: users.role
              })
              .from(users)
              .where(eq(users.email, user.email))
              .limit(1);

            if (dbUser.length > 0) {
               token.id = dbUser[0].id.toString();
               token.name = dbUser[0].name; // Override Google name with DB name
               token.role = dbUser[0].role;
            }
         } catch (e) {
            console.error(e);
         }
      }
      return token;
    },
    async session({ session, token }) {
      // Attach info from token to session
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name; // Apply DB name to session
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Default sign in page if things go wrong
    error: "/",  // Redirect back to home for unauthorized emails
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
