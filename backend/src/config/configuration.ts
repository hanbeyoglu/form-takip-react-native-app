export default () => ({
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? "",
  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    apiKey: process.env.FIREBASE_WEB_API_KEY ?? ""
  }
});
