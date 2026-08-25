const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'netstart_super_secret_key_gnc_capstone'; // For mock purposes

app.use(cors());
app.use(express.json());

const users = [];

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
};

app.post('/api/auth/register', (req, res) => {
  const { studentId, fullName, email, password } = req.body;

  if (!studentId || !fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if user already exists
  const userExists = users.find((u) => u.email === email || u.studentId === studentId);
  if (userExists) {
    return res.status(400).json({ message: 'User with this Email or Student ID already exists.' });
  }

  // Create new user (Mocking password hashing for brevity)
  const newUser = {
    id: users.length + 1,
    studentId,
    name: fullName,
    email,
    password, // In a real app, hash this password
  };

  users.push(newUser);

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Find user
  const user = users.find((u) => u.email === email);

  // Validate password (Mocking hash comparison)
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = generateToken(user);

  res.status(200).json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/', (req, res) => {
  res.send('NetStart Backend API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
