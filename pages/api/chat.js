/**
 * CV Generation API Route
 * 
 * This API endpoint processes user-submitted CV form data, formats it for OpenAI,
 * sends a request to the OpenAI API to generate a professional CV, and stores
 * both the original data and the generated CV in MongoDB.
 * 
 * Technologies:
 * - Next.js API Routes: Server-side endpoints for handling HTTP requests
 * - MongoDB/Mongoose: Database storage for CV data
 * - OpenAI API: Generative AI for creating professional CV content
 * - Fetch API: For making HTTP requests to external services
 */

// Import database connection utility
import dbConnect from '../../lib/mongodb';
// Import CV model for database operations
import CV from '../../models/CV';
// Import session utilities for user authentication
import { withSessionRoute, getUserFromSession } from '../../lib/session';

/**
 * API Route Handler Function
 * 
 * Processes POST requests containing CV form data, generates a CV using OpenAI,
 * and saves it to the database.
 * 
 * @param {Object} req - Next.js request object containing the HTTP request details
 * @param {Object} res - Next.js response object for sending HTTP responses
 * @returns {Promise<void>} Async function that resolves when the response is sent
 */
async function handler(req, res) {
    // Extract formData from the request body using destructuring assignment
    // Destructuring is a JavaScript feature that unpacks values from objects or arrays
    // This line is equivalent to: const formData = req.body.formData;
    const { formData } = req.body;

    // Validate that form data exists - return early with 400 error if missing
    if (!formData) {
        return res.status(400).json({ error: 'Form data is required' });
    }

    // Get the current user from the session
    const user = await getUserFromSession(req);
    
    // Check if user is authenticated
    if (!user || !user.id) {
        return res.status(401).json({ error: 'You must be logged in to create a CV' });
    }

    /**
     * Experience Data Formatting
     * 
     * Formats the experience array for ChatGPT to understand.
     * This turns the array of experience objects into a nicely formatted string.
     */
    const formattedExperience = formData.experience
        .map(
            // The map() method creates a new array by calling a function on every element in the original array
            // For each experience object (exp) at position (index) in the array:
            (exp, index) => `
            ${index + 1}. Title: ${exp.title || 'N/A'}       
               Company: ${exp.company || 'N/A'}             
               Start Date: ${exp.startDate || 'N/A'}        
               End Date: ${exp.endDate || 'N/A'}            
               Responsibilities: ${exp.responsibilities || 'N/A'} 
            `
            // The "|| 'N/A'" syntax is a fallback - if the value is empty/null/undefined, use "N/A" instead
            // We add (index + 1) to start numbering from 1 instead of 0, which is more natural for reading
        )
        .join('\n'); // Join all the array items together with newlines between them

    /**
     * Education Data Formatting
     * 
     * Similar approach for education data - converts the education array into a readable string.
     * This uses the same map() technique to process each education entry.
     */
    const formattedEducation = formData.education
        .map(
            // For each education entry (edu) at position (index) in the array:
            (edu, index) => `
            ${index + 1}. Degree: ${edu.degree || 'N/A'}    
               Institution: ${edu.institution || 'N/A'}    
               Graduation Date: ${edu.graduationDate || 'N/A'} 
            `
            // Again using the || operator for default values when fields are empty
        )
        .join('\n'); // Combines all education entries into a single string with line breaks

    try {
        /**
         * OpenAI Prompt Construction
         * 
         * Creates a detailed prompt string that instructs the OpenAI model on what to generate.
         * Uses template literals to include all CV data in a structured format.
         */
        const detailedPrompt = `You are a professional CV writer. Create a polished and professional CV based on the following details:
        
        Name: ${formData.name || 'N/A'}
        Email: ${formData.email || 'N/A'}
        Phone: ${formData.phone || 'N/A'}
        LinkedIn: ${formData.linkedin || 'N/A'}
        Objective: ${formData.objective || 'N/A'}
        Skills: ${formData.skills || 'N/A'}
        Certifications: ${formData.certifications || 'N/A'}
        Hobbies: ${formData.hobbies || 'N/A'}

        Experience:
        ${formattedExperience || 'No experience provided'}

        Education:
        ${formattedEducation || 'No education provided'}

        Make sure to highlight strengths and expand upon the details provided.`;

        /**
         * OpenAI API Request
         * 
         * Makes an HTTP POST request to the OpenAI Chat Completions API endpoint
         * to generate the CV content based on the prepared prompt.
         */
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST', // Use POST method to send data to the API
            headers: {
                'Content-Type': 'application/json', // Set content type to JSON
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Authenticate with API key from environment variables
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Specify which OpenAI model to use (GPT-4o offers good balance of quality and cost)
                messages: [{ role: 'user', content: detailedPrompt }], // Format the prompt as a user message
                max_tokens: 1000, // Limit response length to control costs and response size
            }),
        });

        // Error handling for OpenAI API response
        if (!response.ok) {
            // Extract detailed error information from the response
            const errorDetail = await response.json();
            // Log the error details for debugging
            console.error('OpenAI API Error Details:', errorDetail);
            // Throw an error with the HTTP status code to be caught in the catch block
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        // Parse the successful OpenAI response JSON 
        const data = await response.json();
        // Extract the generated CV text from the response message content
        const botResponse = data.choices[0].message.content;

        /**
         * Database Operations
         * 
         * Connect to MongoDB and save the CV data along with the generated CV content.
         */
        // Establish MongoDB connection
        await dbConnect();
        
        // Create a new CV document in the database with form data and generated CV
        // Adding the user ID reference to associate the CV with the logged-in user
        const savedCV = await CV.create({
            ...formData, // Spread all form fields into the document
            generatedCV: botResponse, // Add the generated CV text
            user: user.id // Associate the CV with the current user
        });

        /**
         * Response Handling
         * 
         * Send a successful response back to the client with both the generated CV
         * and the ID of the saved database record.
         */
        res.status(200).json({ 
            response: botResponse, // Return the generated CV text
            savedCV: savedCV._id   // Return the MongoDB document ID for future reference
        });
    } catch (error) {
        /**
         * Error Handling
         * 
         * Handle any errors that occur during API requests or database operations
         * and return an appropriate error response.
         */
        // Log the error for server-side debugging
        console.error('Error:', error.message);
        // Return a 500 error response with details to the client
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
}

// Export the handler with session support
export default withSessionRoute(handler);
