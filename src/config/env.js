import "dotenv/config";

const env = {
	API_URL: process.env.API_URL,
	NODE_ENV: process.env.NODE_ENV,
	APP_URL: process.env.APP_URL,
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
};

export default env;
