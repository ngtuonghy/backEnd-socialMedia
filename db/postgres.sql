CREATE TABLE users (
user_id VARCHAR(21),
account_type VARCHAR(20) DEFAULT 'user',
username VARCHAR(50) UNIQUE,
password TEXT,
email VARCHAR(255) UNIQUE,
verified_email BOOLEAN,
created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

CREATE TABLE user_information (
user_id VARCHAR(21) PRIMARY KEY,
avatar_url TEXT,
first_name VARCHAR(70),
last_name VARCHAR(70),
sex VARCHAR(10),
day_of_birth DATE,
city TEXT,
phone VARCHAR(16), 

FOREIGN KEY (user_id) REFERENCES user_information(user_id)
);
