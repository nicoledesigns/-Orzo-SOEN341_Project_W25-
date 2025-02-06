const http = require('http');       // Node.js built-in HTTP module
const url = require('url');         // URL parsing module
const mysql = require('mysql2');    // MySQL database connection
const bcrypt = require('bcrypt');   // Password hashing
const jwt = require('jsonwebtoken'); // JWT authentication

const SECRET_KEY = 'your_secret_key'; // Secret key for JWT signing

// Connect to MySQL Database (need to do)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'chathaven'
});

// Handle database connection (need to do )
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log(' Connected to MySQL database');
    }
});

// Create HTTP Server
const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url, true);

    // Route handling
    if (req.method === 'POST' && pathname === '/signup') {
        handleSignup(req, res);
    } else if (req.method === 'POST' && pathname === '/login') {
        handleLogin(req, res);
    } else if (req.method === 'POST' && pathname === '/create-team') {
        handleCreateTeam(req, res);
    } else if (req.method === 'POST' && pathname === '/assign-user') {
        handleAssignUser(req, res);
    } else {
        // Handle unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

// Handle User Signup
const handleSignup = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', async () => {
        const { name, email, password, role } = JSON.parse(body);
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password

        const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, hashedPassword, role || 'user'], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error signing up' }));
            } else {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User registered successfully' }));
            }
        });
    });
};

// Handle User Login
const handleLogin = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', () => {
        const { email, password } = JSON.parse(body);

        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], async (err, results) => {
            if (err || results.length === 0) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid email or password' }));
                return;
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid email or password' }));
                return;
            }

            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Login successful', token }));
        });
    });
};

// Handle Admin Creating a Team
const handleCreateTeam = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', () => {
        const { token, teamName } = JSON.parse(body);

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Forbidden: Admins only' }));
                return;
            }

            db.query("INSERT INTO teams (name) VALUES (?)", [teamName], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Error creating team' }));
                } else {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Team created successfully' }));
                }
            });

        } catch (error) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
    });
};

// Handle Assigning Users to Teams
const handleAssignUser = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', () => {
        const { token, userId, teamId } = JSON.parse(body);

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Forbidden: Admins only' }));
                return;
            }

            const sql = "INSERT INTO team_members (user_id, team_id) VALUES (?, ?)";
            db.query(sql, [userId, teamId], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Error assigning user to team' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User assigned to team' }));
                }
            });

        } catch (error) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
    });
};

// Start the Server (test on local)
server.listen(3001, () => {
    console.log('Server running on http://localhost:5000');
});
