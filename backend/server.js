
const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const User = require('./models/User'); // user model contains user and admin
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { connectDB } = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const auth = require('./middleware/Auth');

// Creating an express and checking the port number in .env file or selecting default as 5000
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configurations
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Parses incoming requests with JSON payloads

// Connecting to MongoDB database
connectDB();

// API endpoint to get all the assignments for an admin
app.get('/admin/assignments/:adminId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ admin: req.params.adminId })
      .populate('user', 'name') // Populate user details
      .sort('-createdAt');
    res.json(assignments); // Sending the found assignments as JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handling errors and sending error message
  }
});

// API endpoint to get all admin users
app.get('/api/admins', async (req, res) => {
    try {
      // Finding all users with isAdmin set to true and selecting only username and _id
      const admins = await User.find({ isAdmin: true }).select('username _id');
      res.json(admins); // Sending this found admins as JSON response
    } catch (error) {
      res.status(500).json({ message: error.message }); 
    }
  });

  // API endpoint to create a new assignment
app.post('/assignments', auth, async (req, res) => {
    try {
      // Extracting task and adminId 
      const { task, adminId } = req.body;
      const userId = req.user.id; 
  
      // Creating a new assignment with the extracted details and setting status to 'pending'
      const newAssignment = new Assignment({
        task,
        userId: userId,
        admin: adminId,
        status: 'pending'
      });
  
      // Saving the new assignment to the database
      await newAssignment.save();
      res.status(201).json(newAssignment); 
    } catch (error) {
      console.error('Assignment creation error:', error); 
      res.status(400).json({ message: error.message }); 
    }
  });

// API endpoint to accept or reject
app.patch('/admin/assignments/:assignmentId', async (req, res) => {
  try {
    const { status } = req.body;
    // Validating the status 
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' }); 
    }
    
    // Updating the assignment status by its ID
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.assignmentId,
      { status },
      { new: true }
    );
    
    // Handling assignment not found error
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment); // Sending the updated assignment
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
});

// API endpoint to create a new assignment without authentication (already authenticated)
app.post('/assignments', async (req, res) => {
  try {
    const adminId = mongoose.Types.ObjectId(req.body.adminId);
    
    // Creating a new assignment by setting adminId
    const newAssignment = new Assignment({
      admin: adminId
    });

    // Saving the new assignment to the database
    await newAssignment.save();
    res.status(201).json(newAssignment); 
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
});

// Mounting routes for users and admins
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server is successfully running on port ${PORT}`));
