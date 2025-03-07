const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('node:fs');
const { formatDate } = require('./tools');
const { channel } = require('node:diagnostics_channel');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db', 'orzo_chatheaven.db');


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
        return;
    }
    console.log("Connected to SQLite database!");
});

// User signup
app.post("/signup", (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.error("Salt generation error:", err);
            return res.status(500).json({ error: "Signup failed" });
        }

        bcrypt.hash(password, salt, (err, hashedPassword) => {
            if (err) {
                console.error("Password hashing error:", err);
                return res.status(500).json({ error: "Signup failed" });
            }

            const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            db.run(sql, [name, email, hashedPassword, role], function (err) {
                if (err) {
                    console.error("Signup error:", err);
                    return res.status(500).json({ error: "Signup failed" });
                }
                console.log("User registered:", this.lastID);
                return res.status(201).json({ message: "User registered successfully", userId: this.lastID });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
    }

    const sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";

    db.get(sql, [email], (err, row) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ error: "Login failed" });
        }

        if (!row) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error("Password comparison error:", err);
                return res.status(500).json({ error: "Login failed" });
            }

            if (result) {
                console.log("Login successful:", row);
                return res.json({
                    message: "Login successful",
                    user: {
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        role: row.role
                    }
                });
            } else {
                console.log("Wrong password");
                return res.status(401).json({ error: "Invalid credentials" });
            }
        });
    });
});


// Add a new channel
app.post("/addChannel", (req, res) => {
    const { name } = req.body;
    if (!name) {
        console.error("Channel name is missing");
        return res.status(400).json({ error: "Channel name is required!" });
    }

    const sql = "INSERT INTO channels (name) VALUES (?)";
    db.run(sql, [name], function (err) {
        if (err) {
            console.error("Error adding channel:", err);
            return res.status(500).json({ error: "Failed to add channel" });
        }
        const channelId = this.lastID;
        console.log("Channel added successfully with ID:", this.lastID);


        const filePath = path.join(__dirname, 'db', `#${channelId}.txt`)

        fs.writeFile(filePath, '', function (err) {
            if (err) throw err;
            console.log(`File created: ${filePath}`);
        });

        res.status(201).json({ message: "Channel added successfully", channelId: this.lastID });
    });
    //this creates a new file each time there is a new channel created (still has to be tested)


});

// Get channels for a specific user
app.get("/getUserChannels/:userId", (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sql = `
        SELECT c.id AS channel_id, c.name AS channel_name
        FROM channels c
        INNER JOIN channel_members cm ON c.id = cm.channel_id
        WHERE cm.user_id = ?
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching user channels:", err);
            return res.status(500).json({ error: "Failed to fetch user channels" });
        }

        const channels = rows.map(row => ({
            id: row.channel_id,
            name: row.channel_name
        }));

        res.status(200).json({ channels });
    });
});

// Add users to a channel
app.post("/addUserToChannel", (req, res) => {
    const { channelId, userIds } = req.body;

    if (!channelId || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: "Invalid input!" });
    }

    const sql = `
        INSERT INTO channel_members (channel_id, user_id)
        VALUES (?, ?)
        ON CONFLICT(channel_id, user_id) DO NOTHING
    `;

    const dbTasks = userIds.map((userId) =>
        new Promise((resolve, reject) => {
            db.run(sql, [channelId, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        })
    );

    Promise.all(dbTasks)
        .then(() => res.status(200).json({ message: "Users added to channel successfully" }))
        .catch((err) => res.status(500).json({ error: "Failed to add users", details: err }));
});

// Get all users
app.get("/getUsers", (req, res) => {
    const sql = "SELECT id, name FROM users";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: "Failed to fetch users" });
        }

        const users = rows.map((row) => ({
            id: row.id,
            name: row.name,
        }));

        res.status(200).json({ users });
    });
});

// Get all channels
app.get("/getChannels", (req, res) => {
    const sql = `
        SELECT c.id AS channel_id, c.name AS channel_name, 
               GROUP_CONCAT(u.name) AS members
        FROM channels c
        LEFT JOIN channel_members cm ON c.id = cm.channel_id
        LEFT JOIN users u ON cm.user_id = u.id
        GROUP BY c.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching channels:", err);
            return res.status(500).json({ error: "Failed to fetch channels" });
        }

        const channels = rows.map((row) => ({
            id: row.channel_id,
            name: row.channel_name,
            members: row.members ? row.members.split(",") : [],
        }));

        res.status(200).json({ channels });
    });
});

//writes the message received in a file that is corresponding to the channel id
app.post("/sendMessage", (req, res) => {
    const { userId, channelId, message } = req.body;

    if (!userId || !channelId || !message) {
        return res.status(400).json({ error: "Invalid input!" });
    }

    const dataPath = '/orzo_chatheaven/src/db';
    const date = new Date();
    const formattedDate = formatDate(date);
    const formattedMessage = `${userId}; ${message}; ${formattedDate}`;
    const specificFile = dataPath.concat("/#", channelId.toString(), ".txt");

    fs.appendFile(specificFile, formattedMessage, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Invalid channel!" });
        } else {
            console.log(formattedMessage);
        }
    });
});

// messaging in a specific channel
app.get("/loadMessages/:channelId", (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        return res.status(400).json({ error: "Channel ID is required" });
    }
    const filePath = path.join(__dirname, 'db', `#${channelId}.txt`);
    const sql = 'SELECT name FROM users WHERE '

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read file" });
        }

        const messages = data
            .split("\n")
            .filter(line => line.trim() !== "") // Remove empty lines
            .map(line => {
                const [userId, message, time] = line.split(";");
                return { userId, message, time };
            });

        const userIds = [...new Set(messages.map(msg => msg.userId))];
        const placeholders = userIds.map(() => "?").join(",");
        const sql = `SELECT id, name FROM users WHERE userId IN (${placeholders})`;

        db.all(sql, userIds, (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to fetch user data" });
            }

            const userMap = Object.fromEntries(rows.map(user => [user.id.toString(), user.name]));


            const enrichedMessages = messages.map(msg => ({
                userId: msg.userId,
                username: userMap[msg.userId] || "Unknown",
                message: msg.message,
                time: msg.time
            }));


            res.status(200).json({ enrichedMessages });
        });
    });
});

//deleteting a message in a specific channel by an admin
// app.delete("/deleteMessage/:channelId/:userId/:message/:time", (req, res) => {
//     const { channelId, userId, message, time } = req.params;

//     if (!channelId || !userId || !message || !time) {
//         return res.status(400).json({ error: "Invalid input!" });
//     }
//     // Path to the file. would be good if the text file had the channel id as the name - REMEMBER 
//     const filePath = path.join(__dirname, 'db', `#${channelId}.txt`);


//     // Check if the user is an admin
//     if (!isAdmin(userId)) {
//         return res.status(403).json({ error: "Not authorized" });
//     }

//     // Read the file
//     fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ error: "Failed to read file" });
//         }

//         // Parse the messages from the file
//         const messages = data
//             .split("\n")

//             .map(line => {
//                 const [msgUserId, msg, msgTime] = line.split(";");
//                 return { msgUserId, msg, msgTime };
//             });

//         // Find the message to delete by matching userId, message, and time
//         const index = messages.findIndex(msg => msg.msgUserId === userId && msg.msg === message && msg.msgTime === time);
//         if (index === -1) {
//             return res.status(404).json({ error: "Message not found" });
//         }

//         // Delete the message
//         messages.splice(index, 1);

//         // Create new content to save back to the file
//         const newContent = messages.map(msg => `${msg.msgUserId};${msg.msg};${msg.msgTime}`).join("\n");

//         // Write the new content to the file
//         fs.writeFile(filePath, newContent, (err) => {
//             if (err) {
//                 return res.status(500).json({ error: "Failed to write file" });
//             }

//             res.status(200).json({ message: "Message deleted successfully" });
//         });
//     });
// });



// Start the server
app.listen(8081, () => {
    console.log("Server is listening on http://localhost:8081");
});
