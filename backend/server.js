const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const User = require('./models/User'); // Assuming you have a User model
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { connectDB } = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const auth = require('./middleware/Auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Get all assignments for an admin
app.get('/admin/assignments/:adminId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ admin: req.params.adminId })
      .populate('user', 'name') // Populate user details
      .sort('-createdAt');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admin users
app.get('/api/admins', async (req, res) => {
    try {
      const admins = await User.find({ isAdmin: true }).select('username _id');
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Route for creating an assignment
app.post('/assignments', auth, async (req, res) => {
    try {
      const { task, adminId } = req.body;
      const userId = req.user.id; // Assuming you have authentication middleware
  
      const newAssignment = new Assignment({
        task,
        userId: userId,
        admin: adminId,
        status: 'pending'
      });
  
      await newAssignment.save();
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error('Assignment creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });


// Update assignment status (accept or reject)
app.patch('/admin/assignments/:assignmentId', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.assignmentId,
      { status },
      { new: true }
    );
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route for creating an assignment
app.post('/assignments', async (req, res) => {
  try {
    // If admin is supposed to be an ObjectId
    const adminId = mongoose.Types.ObjectId(req.body.adminId);
    
    const newAssignment = new Assignment({
      // ... other fields from req.body ...
      admin: adminId
    });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
