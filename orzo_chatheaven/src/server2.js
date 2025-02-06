const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors()); 
app.use(express.json()) 

const dbPath = path.join(__dirname, 'db', 'orzo_chatheaven.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
        return;
    }
    console.log("Connected to SQLite database!");
});

// app.post("/signup", (req, res) =>{
//     const {name,email, password} = req.body; 
//     const role = "user";
//     const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
//     db.run(sql, [name, email, password, role], function (err) { 
//         if (err) {
//             console.error("Signup error:", err);
//             return res.status(500).json({ error: "Signup failed" });
//         }
//         console.log("User registered:", this.lastID); 
//         return res.status(201).json({ message: "User registered successfully", userId: this.lastID });
//     });
//    // console.log(name, email, password)
        
// })

app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    const role = "user";

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

    // app.post('/login', (req, res) => {
    //      const { email, password } = req.body; 
    //     console.log( email, password)
    //     const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    //     db.get(sql, [email, password], (err, row) => { 
    //         if (err) {
    //             console.error("Login error:", err);
    //             return res.status(500).json({ error: "Login failed" });
    //         }
    //         if (row) {
    //             console.log("success");
    //             return res.json({ message: "Login successful", user: row }); 
                
    //         } else {
    //             console.log("failed log in");
    //             return res.status(401).json({ error: "Invalid credentials" });
                
    //         }
    //     });
    // });

    app.post('/login', (req, res) => {
        const { email, password } = req.body;
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
                    console.log("success");
                    return res.json({ message: "Login successful", user: row });
                } else {
                    console.log("wrong password");
                    return res.status(401).json({ error: "Invalid credentials" });
                }
            });
        });
    });

app.listen(8081, ()  =>{
    console.log("listening");
})