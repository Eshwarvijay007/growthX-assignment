 mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assignment', assignmentSchema);

 // It creates a new assignment in the database.
 //It requires a userId, task, and admin as input.
 //The status of the assignment is set to 'pending' by default.
 //The createdAt field is set to the current date and time.
 
