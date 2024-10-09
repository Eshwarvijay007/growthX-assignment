const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Assignment = require('./models/Assignment'); // Adjust the path as needed
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { connectDB } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
