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
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ username, password, isAdmin: true });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
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
    const { username, password } = req.body;
    let user = await User.findOne({ username, isAdmin: true });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get assignments for admin
router.get('/assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ admin: req.user.id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Accept assignment
router.post('/assignments/:id/accept', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.admin.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    assignment.status = 'accepted';
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Reject assignment
router.post('/assignments/:id/reject', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.admin.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    assignment.status = 'rejected';
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
