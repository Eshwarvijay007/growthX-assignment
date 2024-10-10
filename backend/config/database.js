 mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };


// This code snippet is a module that connects to a MongoDB database using Mongoose.
// It exports a function called connectDB that is an asynchronous function.
// The function uses the MONGODB_URI environment variable to connect to the database.
// If the connection is successful, it logs a message to the console.
// If there is an error, it logs the error and exits the process.
