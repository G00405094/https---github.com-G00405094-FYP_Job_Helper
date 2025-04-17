/**
 * MongoDB Connection Manager
 * 
 * This module provides a utility for establishing and maintaining MongoDB connections
 * using Mongoose ODM (Object Document Mapper). It implements connection pooling with
 * a cached connection that prevents creating multiple connections during development
 * hot reloads or when multiple API routes are called simultaneously.
 * 
 * Technologies:
 * - Mongoose: MongoDB object modeling tool designed to work in an asynchronous environment
 * - Next.js: Used for server environment configuration through environment variables
 */

// Import the Mongoose library for MongoDB interactions
// Mongoose provides a schema-based solution to model application data
import mongoose from 'mongoose';

// Retrieve the MongoDB connection string from environment variables
// This value should be defined in .env.local for local development
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the connection string is available
// Throw an early error if the environment variable is not defined
// This prevents runtime errors when trying to connect to the database
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Connection caching mechanism
 * 
 * What is caching? It's storing something for later use so you don't have to create it again.
 * 
 * In this case, we're storing the database connection in the global object.
 * The 'global' object in Node.js persists data across different function calls,
 * which helps us reuse the same database connection for multiple requests.
 * 
 * This prevents creating a new database connection every time a user makes a request,
 * which would be slow and could overload the database server.
 */
let cached = global.mongoose;

// Check if we already have a cached connection object
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
  // If we already have an active connection, return it immediately
  // This is the fastest path - we already have a connection ready to use
  if (cached.conn) {
    return cached.conn;
  }

  // If we're in the process of connecting (no connection yet, but promise exists),
  // we'll wait for that promise later in the function
  // If we're not connecting yet, start a new connection
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
    // A promise is an object representing a future value - in this case, the future database connection
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        // This code runs when the connection succeeds
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