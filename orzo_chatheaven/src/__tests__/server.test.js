const request = require("supertest");
const { server } = require("../server2");
const sqlite3 = require("sqlite3");
const path = require("path");

let testUser = { name: "Test User", email: "test@example.com", password: "password123", role: "user" };
let testChannel = { name: "Test Channel" };
let testUserId;
let testChannelId;

const dbPath = path.join(__dirname, "../db/test_orzo_chatheaven.db");
const db = new sqlite3.Database(dbPath);

beforeAll((done) => {
    db.serialize(() => {
        db.run("DROP TABLE IF EXISTS channel_requests", () => {
            db.run("DROP TABLE IF EXISTS channel_members", () => {
                db.run("DROP TABLE IF EXISTS channels", () => {
                    db.run("DROP TABLE IF EXISTS users", () => {
                        db.run(`CREATE TABLE users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            email TEXT NOT NULL, 
                            password TEXT NOT NULL, 
                            role TEXT NOT NULL,
                            status TEXT DEFAULT 'offline',
                            last_seen TEXT
                        )`, () => {
                            db.run(`CREATE TABLE channels (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL UNIQUE,
                                is_private INTEGER DEFAULT 0
                            )`, () => {
                                db.run(`CREATE TABLE channel_members (
                                    channel_id INTEGER NOT NULL,
                                    user_id INTEGER NOT NULL,
                                    PRIMARY KEY (channel_id, user_id),
                                    FOREIGN KEY (channel_id) REFERENCES channels(id),
                                    FOREIGN KEY (user_id) REFERENCES users(id)
                                )`, () => {
                                    db.run(`CREATE TABLE IF NOT EXISTS channel_requests (
                                        user_id INTEGER NOT NULL,
                                        channel_id INTEGER NOT NULL,
                                        PRIMARY KEY (user_id, channel_id),
                                        FOREIGN KEY (user_id) REFERENCES users(id),
                                        FOREIGN KEY (channel_id) REFERENCES channels(id)
                                    )`, () => {
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

describe("ChatHaven API Tests", () => {

    test("POST /signup - should register a new user", async () => {
        const res = await request(server).post("/signup").send(testUser);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
        testUserId = res.body.userId;
    });

    test("POST /login - should log in an existing user", async () => {
        const res = await request(server).post("/login").send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(testUser.email);
        testUserId = res.body.user.id;
    });

    test("POST /addChannel - should create a new channel", async () => {
        const res = await request(server).post("/addChannel").send({ name: testChannel.name });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Channel added successfully");
        expect(res.body.channelId).toBeDefined();
        testChannelId = res.body.channelId;
    });

    test("POST /addUserToChannel - should add a user to a channel", async () => {
        const res = await request(server).post("/addUserToChannel").send({
            channelId: testChannelId,
            userIds: [testUserId]
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Users added to channel successfully");
    });

    test("POST /addUserToChannel - should fail with 400 on invalid input", async () => {
        const res = await request(server).post("/addUserToChannel").send({
          channelId: null,
          userIds: "invalid"
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid input!");
      });
    
      test("POST /createPrivateChannel - should fail with 400 if name is missing", async () => {
        const res = await request(server).post("/createPrivateChannel").send({
          name: ""
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid input!");
      });

    test("GET /getUserChannels/:userId - should return the channels a user is in", async () => {
        const res = await request(server).get(`/getUserChannels/${testUserId}`);
        expect(res.status).toBe(200);
    });

    test("POST /requestToJoinChannel - should allow a user to request to join a channel", async () => {
        const res = await request(server).post("/requestToJoinChannel").send({
            userId: testUserId,
            channelId: testChannelId
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Request sent successfully");
    });

    test("POST /requestToJoinChannel - should fail with 400 if request already exists", async () => {
        await request(server).post("/requestToJoinChannel").send({
          userId: testUserId,
          channelId: testChannelId
        });
    
        const res = await request(server).post("/requestToJoinChannel").send({
          userId: testUserId,
          channelId: testChannelId
        });
    
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Request already exists");
      });

    let privateChannelId;
    let secondUserId;
  
    const secondUser = {
      name: "Second User",
      email: "second@example.com",
      password: "password456",
      role: "user",
    };
  
    test("POST /signup - should register a second user", async () => {
      const res = await request(server).post("/signup").send(secondUser);
      expect(res.status).toBe(201);
      secondUserId = res.body.userId;
    });
  
    test("POST /autoJoinDefaultChannels - should auto-join users to default channels", async () => {
      const res = await request(server).post("/autoJoinDefaultChannels");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("All users auto-joined to default channels successfully.");
    });
  
    test("POST /createPrivateChannel - should create a private channel and add the creator", async () => {
      const res = await request(server).post("/createPrivateChannel").send({
        name: "Secret Base",
        userId: testUserId,
      });
      expect(res.status).toBe(200);
      expect(res.body.channelId).toBeDefined();
      privateChannelId = res.body.channelId;
    });
  
    test("POST /addUserToPrivateChannel - should allow creator to add another user", async () => {
      const res = await request(server).post("/addUserToPrivateChannel").send({
        channelId: privateChannelId,
        userIds: [secondUserId],
        requestedID: testUserId,
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Users added to channel successfully");
    });

    test("POST /addUserToPrivateChannel - should fail with 400 if required fields are missing", async () => {
        const res = await request(server).post("/addUserToPrivateChannel").send({
          channelId: privateChannelId
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid input!");
      });
    
      test("POST /addUserToPrivateChannel - should fail with 403 if requester is not a member", async () => {
        const res = await request(server).post("/addUserToPrivateChannel").send({
          channelId: privateChannelId,
          userIds: [testUserId],
          requestedID: 9999 
        });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe("Not authorized");
      });
  
    test("GET /userChannels/:userId should list channels for a user", async () => {
      const res = await request(server).get(`/userChannels/${secondUserId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.channels)).toBe(true);
      const channelNames = res.body.channels.map((c) => c.name);
      expect(channelNames).toContain("Secret Base");
    });
});

afterAll(async () => {
    await new Promise((resolve) => db.close(() => {
        console.log("Database connection closed.");
        resolve();
    }));

    await new Promise((resolve) => server.close(() => {
        console.log("Server closed.");
        resolve();
    }));
});
