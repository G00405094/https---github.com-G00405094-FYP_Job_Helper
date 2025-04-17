/**
 * CV Data Model
 * 
 * This file defines the structure of CV data for our database.
 * 
 * What is a database schema? It's like a blueprint that describes what data we'll store
 * and how it should be organized. Just like a form has fields for name, email, etc.,
 * a schema defines what fields our database documents will have.
 * 
 * Technologies used:
 * - MongoDB: A NoSQL database that stores data as "documents" (similar to JSON objects)
 * - Mongoose: A JavaScript library that makes working with MongoDB easier and adds
 *   features like schemas, validation, and type checking
 */

// Import the mongoose library so we can create schemas and models
import mongoose from 'mongoose';

/**
 * Experience Schema Definition
 * 
 * This creates a template for what each work experience entry should contain.
 * Think of this as defining a custom data type for "work experience".
 * 
 * The "new mongoose.Schema({})" syntax creates a new schema object.
 * Inside the curly braces, we define what fields this schema will have.
 */
const ExperienceSchema = new mongoose.Schema({
  // For each field, we define the data type (String in these cases)
  title: String,         // Job title (e.g., "Software Developer")
  company: String,       // Where the person worked
  startDate: String,     // When they started (using String instead of Date for flexibility)
  endDate: String,       // When they ended (or "Present" for current jobs)
  responsibilities: String, // What they did at this job
});

/**
 * Education Schema Definition
 * 
 * Similar to the Experience schema, this defines what education entries look like.
 * Each education entry will have these three fields.
 */
const EducationSchema = new mongoose.Schema({
  degree: String,        // What degree/certificate they earned (e.g., "Bachelor of Science") 
  institution: String,   // Where they studied (school/university name)
  graduationDate: String, // When they graduated
});

/**
 * Main CV Schema Definition
 * 
 * This is the primary schema that defines the complete CV document structure.
 * It includes all the user's personal info, plus the arrays of experience and education.
 * 
 * Notice how we can nest schemas within schemas - the experience and education fields
 * use the schemas we defined above.
 */
const CVSchema = new mongoose.Schema({
  // Basic personal information as simple String fields
  name: String,
  email: String,
  phone: String,
  linkedin: String,
  objective: String,     // Career goals or personal statement
  
  // Skills and qualifications as String fields
  // These are stored as single strings rather than arrays for simplicity
  skills: String,        // Comma-separated list of skills
  certifications: String, // Certificates and qualifications
  hobbies: String,       // Personal interests
  
  // Arrays of nested documents using our custom schemas
  // The square brackets [] indicate "this is an array of ExperienceSchema objects"
  experience: [ExperienceSchema], // Can have multiple work experiences
  education: [EducationSchema],   // Can have multiple education entries
  
  // The generated CV text from OpenAI
  generatedCV: String,
  
  // Reference to the User who owns this CV
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Special field with configuration object instead of just a type
  // This automatically adds a timestamp whenever a new CV is created
  createdAt: { 
    type: Date,          // The data type is Date (not String)
    default: Date.now    // Default value is the current time when document is created
  },
});

/**
 * Model Export with Development Mode Protection
 * 
 * This line does two important things:
 * 
 * 1. Creates a "model" based on our schema. Models are like JavaScript classes
 *    that let us create, read, update, and delete documents in MongoDB.
 * 
 * 2. Uses a special pattern (mongoose.models.CV || mongoose.model(...))
 *    to prevent errors during development. This checks if the model already exists
 *    before creating a new one, which prevents errors when the server restarts.
 * 
 * The "||" is the logical OR operator - it returns the first "truthy" value.
 * So this says "use the existing CV model if it exists, otherwise create a new one"
 */
export default mongoose.models.CV || mongoose.model('CV', CVSchema); 