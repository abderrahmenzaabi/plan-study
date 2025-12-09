require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
    host: process.env.DB_HOST || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Gestbiblio",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const SECRET_KEY = process.env.JWT_SECRET || "your_super_secret_key";  

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL database: Gestbiblio");
        connection.release();
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, SECRET_KEY, (err, user) => {  
        if (err) return res.status(403).json({ error: "Invalid token." });
        req.user = user; 
        next();
    });
}

// REGISTER
app.post('/register', async (req, res) => {
    try {
        let { username, email, password } = req.body;
        email = email.toLowerCase().trim(); // normalize email
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists
        db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error: " + err.message });
            if (results.length > 0) return res.status(400).json({ error: "Email already registered" });

            // Insert new user
            db.query(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ error: "Database error: " + err.message });
                    res.json({ message: "User registered successfully" });
                }
            );
        });

    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
});

// LOGIN
app.post("/login", (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase().trim(); // normalize email

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });
        if (results.length === 0) return res.status(401).json({ error: "User not found" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
            res.json({
                message: "Login successful",
                token,
                username: user.username,
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

// TASKS
app.post("/tasks", authenticateToken, (req, res) => {
    const { taskText } = req.body;
    if (!req.user?.userId || !taskText) return res.status(400).json({ error: "Missing task text" });

    executeQuery(
        "INSERT INTO tasks (user_id, task_text) VALUES (?, ?)",
        [req.user.userId, taskText],
        res,
        "Task added successfully"
    );
});

app.get("/tasks", authenticateToken, (req, res) => {
    executeQuery("SELECT * FROM tasks WHERE user_id = ?", [req.user.userId], res);
});

app.put("/tasks/:taskId", authenticateToken, (req, res) => {
    const { completed } = req.body;
    executeQuery(
        "UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?",
        [completed, req.params.taskId, req.user.userId],
        res,
        "Task updated successfully"
    );
});

app.delete("/tasks/:taskId", authenticateToken, (req, res) => {
    executeQuery(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [req.params.taskId, req.user.userId],
        res,
        "Task deleted successfully"
    );
});

// Helper function
function executeQuery(query, params, res, successMessage = null) {
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error: " + err.message });
        res.json(successMessage ? { message: successMessage } : results);
    });
}

// Start server
app.listen(3001, () => {
    console.log("🚀 Server running on port 3001");
});
