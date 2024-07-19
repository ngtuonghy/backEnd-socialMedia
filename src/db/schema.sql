-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(21) PRIMARY KEY,
    account_type VARCHAR(20) DEFAULT 'user',
    username VARCHAR(30) UNIQUE,
    password TEXT,
    email VARCHAR(255) UNIQUE, 
    verified_email BOOLEAN,
    created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(21) PRIMARY KEY,
    avatar_url TEXT,
    cover_image_url TEXT,
    name VARCHAR(50),
    day_of_birth DATE,
    sex VARCHAR(10),
    location TEXT,
    website TEXT,
    phone VARCHAR(15),
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
    friendship_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user1_id VARCHAR(21) NOT NULL,
    user2_id VARCHAR(21) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    CONSTRAINT fk_user1_id FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user2_id FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_different_users CHECK (user1_id <> user2_id)
);

CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private', 'custom');
CREATE TABLE IF NOT EXISTS posts (
    post_id VARCHAR(22) PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL,
    content TEXT,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    privacy privacy_level NOT NULL DEFAULT 'public',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS media (
    media_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alt TEXT,
    user_id VARCHAR(21) REFERENCES users(user_id) ON DELETE CASCADE,
    post_id VARCHAR(22) REFERENCES posts(post_id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id VARCHAR(21) PRIMARY KEY,
    post_id VARCHAR(22),
    user_id VARCHAR(21),
    reply_to_comment_id VARCHAR(21) REFERENCES comments(comment_id) ON DELETE CASCADE,
    content TEXT,
    media_type VARCHAR(50),
    media_url TEXT,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
);

CREATE TABLE IF NOT EXISTS votes (
    vote_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(21) REFERENCES users(user_id),
    post_id VARCHAR(22) REFERENCES posts(post_id) ON DELETE CASCADE,
    comment_id VARCHAR(21) REFERENCES comments(comment_id) ON DELETE CASCADE,
    vote_state VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

 DROP TABLE IF EXISTS notifications;
 CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL,
    created_by_user_id VARCHAR(21) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_url TEXT,
    is_readed BOOLEAN DEFAULT FALSE,
    notification_data JSONB,
    created_at timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
