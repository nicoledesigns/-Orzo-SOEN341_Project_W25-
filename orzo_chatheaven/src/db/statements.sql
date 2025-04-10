-- CREATE TABLE users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL,
--     email TEXT NOT NULL, 
--     password TEXT NOT NULL, 
--     role TEXT NOT NULL
--     status TEXT NOT NULL
-- );

-- CREATE TABLE channels (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL UNIQUE
-- );

-- CREATE TABLE channel_members (
--     channel_id INTEGER NOT NULL,
--     user_id INTEGER NOT NULL,
--     PRIMARY KEY (channel_id, user_id),
--     FOREIGN KEY (channel_id) REFERENCES channels(id),
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- CREATE TABLE IF NOT EXISTS channel_requests (
--   user_id INTEGER NOT NULL,
--   channel_id INTEGER NOT NULL,
--   PRIMARY KEY (user_id, channel_id),
--   FOREIGN KEY (user_id) REFERENCES users(id),
--   FOREIGN KEY (channel_id) REFERENCES channels(id)
-- );



-- ALTER TABLE channels ADD COLUMN is_private INTEGER DEFAULT 0;
