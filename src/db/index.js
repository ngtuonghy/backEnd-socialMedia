import pg from "pg";
import env from "../config/env.js";

const pool = new pg.Pool({
  user: env.dataBase.pgUser,
  host: env.dataBase.pgHost,
  database: env.dataBase.pgDataBase,
  password: env.dataBase.pgPassword,
  port: env.dataBase.pgPort,
  // ssl: {
  //   require: true,
  // },
});

export default pool;
