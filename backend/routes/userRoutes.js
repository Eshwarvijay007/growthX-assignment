const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/Auth');

// Register user
router.post('/register', async (req, res) => {
  try {
    // Extracts username and password 
    const { username, password } = req.body;
    // Checking if the this name already exist in DB
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Creating a new user 
    user = new User({ username, password });
    // Saves the new user to the database.
    await user.save();

    // Generates a JWT for the user.
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      // Sends the JWT token back to the client(for security).
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    // Extracts username and password 
    const { username, password } = req.body;
    // Finds a user with the given username.
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // validation 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generates a JWT token for the user.
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      // Sends the JWT token back to the client.
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs.
    res.status(500).send('Server error');
  }
});

// Upload assignment
router.post('/upload', auth, async (req, res) => {
  try {
    // Extracts task and admin 
    const { task, admin } = req.body;
    // Creates a new assignment thesee 3 fields
    const assignment = new Assignment({
      userId: req.user.id,
      task,
      admin,
    });
    // Saves the assignment to the DB.
    await assignment.save();
    // Sends the saved assignment back to the client.
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs.
    res.status(500).send('Server error');
  }
});

// Get all admins
router.get('/admins', auth, async (req, res) => {
  try {
    // Finds all users marked as admins and selects only their username and ID.
    const admins = await User.find({ isAdmin: true }).select('-password');
    // Sends the list of admins back to the client.
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs.
    res.status(500).send('Server error');
  }
});

module.exports = router;

// This section of the code sets up routes for 
//user registration, login, assignment upload, and fetching admins.