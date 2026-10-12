
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error(
    "MONGODB_URL is missing from environment variables."
  );
}

// Better Auth secret
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret || authSecret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must contain at least 32 characters."
  );
}

// MongoDB client
const mongoClient = new MongoClient(MONGODB_URL);

const database = mongoClient.db(
  process.env.MONGODB_DB_NAME || "bazardor"
);

// Google OAuth credentials
const googleClientId =
  process.env.BETTER_AUTH_GOOGLE_CLIENT_ID;

const googleClientSecret =
  process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET;

// GitHub OAuth credentials
const githubClientId =
  process.env.BETTER_AUTH_GITHUB_CLIENT_ID;

const githubClientSecret =
  process.env.BETTER_AUTH_GITHUB_SECRET;

// Configure available social providers
const socialProviders = {
  ...(googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}),

  ...(githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        },
      }
    : {}),
};

// Better Auth configuration
export const auth = betterAuth({
  database: mongodbAdapter(database, {
    client: mongoClient,
  }),

  baseURL:
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",

  secret: authSecret,

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  socialProviders,
});
