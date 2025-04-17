/**
 * Cover Letter Generation API Route
 * 
 * This API endpoint generates personalized cover letters by combining user CV data
 * with specific job details. It retrieves the CV from MongoDB, formats the data,
 * and uses OpenAI to generate a tailored cover letter for the specified job.
 * 
 * Technologies:
 * - Next.js API Routes: Server-side endpoint for handling HTTP requests
 * - MongoDB/Mongoose: Database retrieval of stored CV data
 * - OpenAI API: Natural language generation for cover letter content
 * - Fetch API: For making HTTP requests to external services
 */

// Import database connection utility
import dbConnect from '../../lib/mongodb';
// Import CV model for database operations
import CV from '../../models/CV';

/**
 * API Route Handler Function
 * 
 * Processes POST requests containing job details and CV ID,
 * retrieves the CV data, and generates a tailored cover letter.
 * 
 * @param {Object} req - Next.js request object containing the HTTP request details
 * @param {Object} res - Next.js response object for sending HTTP responses
 * @returns {Promise<void>} Async function that resolves when the response is sent
 */
export default async function handler(req, res) {
  // Validate that the request uses the POST method
  // Cover letter generation requires sending data in the request body
  if (req.method !== 'POST') {
    // Return 405 Method Not Allowed if any other HTTP method is used
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract required parameters from the request body using destructuring
  // Destructuring is a JavaScript feature that unpacks values from objects
  // Instead of writing:
  //   const cvId = req.body.cvId;
  //   const jobTitle = req.body.jobTitle;
  //   const company = req.body.company;
  //   const jobDescription = req.body.jobDescription;
  //   const location = req.body.location;
  // We can extract all these variables in one line:
  const { cvId, jobTitle, company, jobDescription, location } = req.body;

  // Validate that all required parameters are provided
  // CV ID, job title, and company are minimum requirements for generation
  if (!cvId || !jobTitle || !company) {
    // Return 400 Bad Request if any required fields are missing
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    /**
     * Database Operations
     * 
     * Connect to MongoDB and fetch the CV document specified by the ID.
     */
    // Establish connection to MongoDB database
    await dbConnect();
    
    // Retrieve the specified CV document by its ID
    const cv = await CV.findById(cvId);
    
    // Check if the CV was found in the database
    if (!cv) {
      // Return 404 Not Found if CV with provided ID doesn't exist
      return res.status(404).json({ error: 'CV not found' });
    }

    /**
     * Data Formatting with Array Methods
     * 
     * Here we convert an array of experience objects into a single readable string.
     * This demonstrates several JavaScript concepts:
     * - map(): transforms each item in an array into something new
     * - join(): combines array items into a single string with a separator
     * - || operator: provides a fallback value when a value is missing
     */
    // The map() method runs a function on each item in the array and returns a new array
    const experienceString = cv.experience
      .map(exp => {
        // For each experience object, create a formatted string
        // The || 'N/A' syntax provides a default value if the date is missing
        return `${exp.title} at ${exp.company} (${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'})`;
      })
      // After mapping, join() connects all array items with a comma and space
      .join(', ');
    
    // Provide a default value of 'N/A' if skills is empty/undefined
    const skillsString = cv.skills || 'N/A';
    
    /**
     * OpenAI Prompt Construction
     * 
     * Create a detailed prompt that instructs the AI on how to generate
     * a personalized cover letter based on the CV and job information.
     */
    const prompt = `
      You are a professional cover letter writer. Create a tailored cover letter for the following job:
      
      Job Title: ${jobTitle}
      Company: ${company}
      Location: ${location || 'Not specified'}
      
      ${jobDescription 
        ? `Job Description: ${jobDescription}` // Use provided job description if available
        : `This is for a ${jobTitle} position at ${company}. Since we don't have a full job description, 
          focus on general skills and experiences relevant for this role and company. Research common 
          responsibilities for this position and tailor the letter accordingly.`  // Fallback if no description provided
      }
      
      Using details from this CV:
      Name: ${cv.name}
      Experience: ${experienceString}
      Skills: ${skillsString}
      
      Write a personalized cover letter that highlights relevant experience and skills for this specific job.
      The tone should be professional but engaging. Keep it under 400 words.
    `;

    /**
     * OpenAI API Request
     * 
     * Send a request to OpenAI's chat completions API to generate
     * the cover letter based on the prepared prompt.
     */
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', // HTTP POST method to send data
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Authenticate with API key from environment variables
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Specify which OpenAI model to use
        messages: [{ role: 'user', content: prompt }], // Format prompt as a user message
        max_tokens: 800,  // Limit response length to control costs and response size
      }),
    });

    /**
     * Error Handling for OpenAI Response
     * 
     * Check if the OpenAI API request was successful and handle errors if not.
     */
    if (!response.ok) {
      // Parse the error response for detailed information
      const errorDetail = await response.json();
      // Log detailed error information for debugging
      console.error('OpenAI API Error Details:', errorDetail);
      // Throw an error with the status code to be caught by the catch block
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    /**
     * Process Successful OpenAI Response
     * 
     * Extract the generated cover letter from the API response.
     */
    // Parse the JSON response from OpenAI
    const data = await response.json();
    // Extract the generated cover letter text from the message content
    const coverLetter = data.choices[0].message.content;

    /**
     * Success Response
     * 
     * Return the generated cover letter to the client.
     */
    res.status(200).json({ coverLetter });
    
  } catch (error) {
    /**
     * Error Handling
     * 
     * Handle any errors that occur during database operations or API requests,
     * and return an appropriate error response.
     */
    // Log the error details for server-side debugging
    console.error('Error generating cover letter:', error);
    // Return a 500 Internal Server Error with error details
    res.status(500).json({ 
      error: 'Failed to generate cover letter', 
      details: error.message 
    });
  }
} 