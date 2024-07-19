import pg from "pg";
import fs from "fs";
const { Client } = pg;
import env from "./../config/env.js";

const DB_NAME = env.dataBase.pgDataBase || "db-name";
const DB_USER = env.dataBase.pgUser || "postgres";
const DB_HOST = env.dataBase.pgHost || "localhost";
const DB_PASSWORD = env.dataBase.pgPassword || "root";
const DB_PORT = parseInt(env.dataBase.pgPort) || 5432;

async function setupDatabase() {
	const isDev = env.NODE_ENV === "development";

	if (!isDev)
		return console.log(
			"in production environment - skipping database creation.",
		);

	const client = new Client({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		port: DB_PORT,
	});

	await client.connect();

	const res = await client.query(
		`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`,
	);

	if (res.rowCount === 0) {
		console.log(`${DB_NAME} database not found, creating it.`);
		await client.query(`CREATE DATABASE "${DB_NAME}";`);
		console.log(`created database ${DB_NAME}.`);
	} else {
		console.log(`${DB_NAME} database already exists.`);
		try {
			processSQLFile("./src/db/schema.sql");
		} catch (error) {
			console.log("error in schema.sql", error);
		}
	}

	await client.end();
}

setupDatabase();

async function processSQLFile(fileName) {
	const client = new Client({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		port: DB_PORT,
		database: DB_NAME,
	});

	await client.connect();

	try {
		// Extract SQL queries from file. Assumes no ';' in the fileNames
		const sql = fs.readFileSync(fileName).toString();

		// Replace newlines with spaces, remove excess whitespace, split by ';', trim each query, filter out empty ones
		const queries = sql
			.replace(/(\r\n|\n|\r)/gm, " ")
			.replace(/\s+/g, " ")
			.split(";")
			.map((query) => query.trim())
			.filter((query) => query.length > 0 && !query.startsWith("--"));

		// Execute each SQL query sequentially
		for (const query of queries) {
			if (query.indexOf("COPY") === 0) {
				// Special handling for COPY command
				const regexp = /COPY\s+(.*)\s+FROM\s+(.*)\s+DELIMITERS/gim;
				const matches = regexp.exec(query);
				if (matches) {
					const table = matches[1];
					const fileName = matches[2].replace(/'/g, ""); // Remove quotes from filename
					const copyString = `COPY ${table} FROM STDIN DELIMITERS ',' CSV HEADER`;
					const stream = client.query(copyString);

					stream.on("end", () => {
						console.log(`Finished copying data into ${table}`);
					});

					const csvFile = __dirname + "/" + fileName;
					const str = fs.readFileSync(csvFile);
					stream.write(str);
					stream.end();
				} else {
					console.error("COPY command syntax is incorrect");
				}
			} else {
				// Execute other queries
				try {
					await client.query(query);
					// console.log("Executed query:", query);
				} catch (err) {
					console.error("Error executing query:", query, err);
					throw err;
				}
			}
		}
		console.log("All queries executed successfully.");
	} catch (err) {
		console.error("Error processing SQL file:", err);
	} finally {
		await client.end();
	}
}

// Usage
