import pool from "./../db/index.js";

export const query = (text, params) => {
	return pool.query(text, params);
};
