import "dotenv/config";

const env = {
  port: process.env.APP_PORT,
  clientPort: process.env.CLIENT_PORT,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  redisPort: process.env.REDIS_PORT,
  dataBase: {
    pgPort: process.env.PG_PORT,
    pgHost: process.env.PG_HOST,
    pgDataBase: process.env.PG_DATABASE,
    pgUser: process.env.PG_USER,
    pgPassword: process.env.PG_PASSWORD,
  },
  uploadImage: {
    cloudnaryName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudnaryApiKey: process.env.COUDINARY_API_KEY,
    cloudnaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  backBlaze: {
    keyId: process.env.BACKBLAZE_KEY_ID,
    applicationKey: process.env.BACKBLAZE_APPLICATION_KEY,
  },
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
  },
};

export default env;
