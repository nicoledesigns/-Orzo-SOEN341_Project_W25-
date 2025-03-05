const request = require("supertest");
const { app } = require("../server2"); // Ensure this correctly exports `app`
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
        db.run("DROP TABLE IF EXISTS channel_members", () => {
            db.run("DROP TABLE IF EXISTS channels", () => {
                db.run("DROP TABLE IF EXISTS users", () => {
                    // Recreate tables
                    db.run(`CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL, 
                        password TEXT NOT NULL, 
                        role TEXT NOT NULL
                    )`, () => {
                        db.run(`CREATE TABLE channels (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL UNIQUE
                        )`, () => {
                            db.run(`CREATE TABLE channel_members (
                                channel_id INTEGER NOT NULL,
                                user_id INTEGER NOT NULL,
                                PRIMARY KEY (channel_id, user_id),
                                FOREIGN KEY (channel_id) REFERENCES channels(id),
                                FOREIGN KEY (user_id) REFERENCES users(id)
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

describe("🔥 ChatHaven API Tests", () => {

    // ✅ **Test User Signup**
    test("POST /signup → should register a new user", async () => {
        const res = await request(app).post("/signup").send(testUser);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
        testUserId = res.body.userId; // Store User ID for later use
    });

    // ✅ **Test User Login**
    test("POST /login → should log in an existing user", async () => {
        const res = await request(app).post("/login").send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(testUser.email);
        testUserId = res.body.user.id;
    });

    test("POST /addChannel → should create a new channel", async () => {
        const res = await request(app).post("/addChannel").send({ name: "Test Channel" });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Channel added successfully");
        expect(res.body.channelId).toBeDefined(); 
    });
    
});

afterAll((done) => {
    db.close(() => {
        done();
    });
});
