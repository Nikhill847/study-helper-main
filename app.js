const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'study_planner'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Serve static files (like HTML and CSS)
app.use(express.static('public'));

// Register route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  const checkUserSQL = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserSQL, [username, email], (err, result) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (result.length > 0) {
      return res.status(400).send('Username or email already exists');
    }

    // Hash the password before storing
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) throw err;
      res.redirect('/home'); // Redirect to home page on success
    });
  });
});

  // Login route
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        const user = result[0];

        // Compare password with hashed password in the database
        if (bcrypt.compareSync(password, user.password)) {
          res.redirect('/home'); // Login success
        } else {
          res.status(400).send('Invalid credentials'); // Wrong password
        }
      } else {
        res.status(400).send('User not found'); // Username not found
      }
    });
  });

  // Home page route
  app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
  });

  // Start server
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
