/**
 * MongoDB Connection Manager
 * 
 * This keeps mongo connection
 * using Mongoose ODM (Object Document Mapper). .
 * 
 * Technologies:
 * - Mongoose: MongoDB object modeling tool designed to work in an asynchronous environment
 * - Next.js: Used for server environment configuration through environment variables
 */


// Mongoose provides a schema-based solution to model application data
import mongoose from 'mongoose';

// my connection string is in env so I just get it here
const MONGODB_URI = process.env.MONGODB_URI;

//check i've actually put the connection in env
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

//caching so it stays connected
let cached = global.mongoose;

// Check if theres already a cached connection
// If not, create a new one with two properties:
// - conn: the actual connection (initially null)
// - promise: a promise that will resolve to the connection (initially null)
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Database connection function
 * 
 * This function manages database connections in a smart way:
 * 1. If a connection already exists, it returns it (fastest)
 * 2. If a connection is in progress, it waits for it (prevents duplicate connections)
 * 3. If no connection exists, it creates a new one (only when needed)
 * 
 * @returns {Promise<Connection>} A promise that resolves to the Mongoose connection object
 */
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Connection options for Mongoose
    const opts = {
      bufferCommands: false, // Don't store commands in memory if connection is lost
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds (default is 30000)
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maximum number of sockets to keep open
      connectTimeoutMS: 10000, // Connection timeout
    };

    // Start connecting to MongoDB and store the promise
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        // Lets me know it's connected
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        // This code runs if the connection fails
        console.error("MongoDB connection error:", error);
        cached.promise = null; // Clear the promise so we can try again
        throw error; // Pass the error up to whoever called this function
      });
  }
  
  try {
    // Wait for the connection process to complete
    // The 'await' keyword pauses execution until the promise resolves
    cached.conn = await cached.promise;
    // Return the established connection
    return cached.conn;
  } catch (error) {
    // If connection fails, reset the promise so we can try again next time
    cached.promise = null;
    throw error;
  }
}

// Export the database connection function as the default export
// This makes it importable using: import dbConnect from 'lib/mongodb'
export default dbConnect; 