const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/Auth');

// Register admin
router.post('/register', async (req, res) => {
  try {
    // Extracts the username and password 
    const { username, password } = req.body; 
    // validating user if present
    let user = await User.findOne({ username });
    // If the user exists, returns an error response indicating that the user already exists.
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Creates a new user with the given username, password, and sets isAdmin to true.
    user = new User({ username, password, isAdmin: true });
    // Saves the new user to the database.
    await user.save();

    // Generates a JSON Web Token (JWT) for the newly registered admin.
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      //authentication.
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
        res.status(500).send('Server error');
  }
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    // Extracts the username and password 
    const { username, password } = req.body;
    let user = await User.findOne({ username, isAdmin: true });
    // same as the above snippet
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compares the provided password with the user's password in the database.
    const isMatch = await bcrypt.compare(password, user.password);
    // If the passwords do not match, returns an error response indicating invalid credentials.
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generates a JWT token for the admin.
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      // Sends the JWT token back to the client for authentication purposes.
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs during the login process.
    res.status(500).send('Server error');
  }
});

// Get assignments for admin
router.get('/assignments', auth, async (req, res) => {
  try {
    // Finds all assignments assigned to the current admin, populates the userId field with the user's username, and sorts them by creation date in descending order.
    const assignments = await Assignment.find({ admin: req.user.id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    // Sends the list of assignments back to the client.
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs while fetching assignments.
    res.status(500).send('Server error');
  }
});

// Accept assignment
router.post('/assignments/:id/accept', auth, async (req, res) => {
  try {
    // Finds the assignment by its ID.
    const assignment = await Assignment.findById(req.params.id);
    // If the assignment is not found, returns an error response indicating that the assignment was not found.
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    // Checks if the current admin is authorized to accept the assignment.
    if (assignment.admin.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    // status'accepted'.
    assignment.status = 'accepted';
    await assignment.save();
    // Sends the updated assignment back to the client.
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    // Sends a server error response if an error occurs while accepting an assignment.
    res.status(500).send('Server error');
  }
});

// Reject assignment
router.post('/assignments/:id/reject', auth, async (req, res) => {
  try {
    // Finds the assignment by its ID.
    const assignment = await Assignment.findById(req.params.id);
    // If the assignment is not found, returns an error response indicating that the assignment was not found.
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    // Checks if the current admin is authorized to reject the assignment.
    if (assignment.admin.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    // status'rejected'.
    assignment.status = 'rejected';
    await assignment.save();
    // Sends the updated assignment back to the client.
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// This section of the code sets up routes for 
//admin registration, login, fetching assignments, accepting assignments, and rejecting assignments.
