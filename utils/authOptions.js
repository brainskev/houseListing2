import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/config/db";
import User from "@/models/User";
import { verifyPassword, normalizeEmail } from "@/utils/authHelpers";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();

          const normalizedEmail = normalizeEmail(credentials.email);
          const user = await User.findOne({ email: normalizedEmail }).select(
            "+hashedPassword +role +username +name +image +status"
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.status === "blocked") {
            throw new Error("Your account has been blocked. Please contact support.");
          }

          if (!user.hashedPassword) {
            throw new Error("Invalid email or password");
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.hashedPassword
          );

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            name: user.name || user.username,
            email: user.email,
            image: user.image,
            role: user.role || "user",
          };
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      await connectDB();
      const normalizedEmail = profile?.email?.toLowerCase();
      if (!normalizedEmail) return false;

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        const username = profile?.name?.slice(0, 20) || normalizedEmail.split("@")[0];
        await User.create({
          email: normalizedEmail,
          name: profile?.name,
          username,
          image: profile?.picture,
          role: "user",
          status: "active",
        });
      } else if (existingUser.status === "blocked") {
        return false; // Block login for blocked users
      }
      return true;
    },
    async jwt({ token, user }) {
      await connectDB();

      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.name = user.name;
        token.status = user.status || "active";
      } else if (token?.email) {
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
          token.name = dbUser.name || dbUser.username;
          token.status = dbUser.status || "active";
          
          // Block access if user is blocked
          if (dbUser.status === "blocked") {
            return null; // This will end the session
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.user.name = token.name || session.user.name;
      }
      return session;
    },
  },
};

export default authOptions;
