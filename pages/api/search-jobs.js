/**
 * Job Search API Route
 * 
 * What is an API route?
 * Think of an API route like a special function that runs on the server when
 * someone visits a specific URL. It's like a waiter at a restaurant who takes
 * your order (the request) and brings back your food (the response).
 * 
 * This particular API route does three main things:
 * 1. Receives a job search request from the user (with job title and location)
 * 2. Forwards that request to an external job search service (FindWork.dev)
 * 3. Returns the job listings back to the user
 * 
 * Technologies used:
 * - Next.js API Routes: A feature that lets us create server functions easily
 * - Fetch API: JavaScript's built-in way to request data from other websites
 * - FindWork.dev API: An external service that provides job listings
 * - Environment Variables: Secret values stored on the server (like API keys)
 */

// The starting point of the URL we'll call to get job listings
// This is like the base address of the external service
const API_URL = "https://findwork.dev/api/jobs/";

/**
 * Main API Handler Function
 * 
 * This function runs every time someone makes a request to this API route.
 * It's like the main program that processes the request and sends back a response.
 * 
 * @param {Object} req - Contains all the information about the incoming request
 * @param {Object} res - What we use to send back a response
 */
export default async function handler(req, res) {
  // Get the search terms from the request URL
  // For example, if someone visits: /api/search-jobs?query=developer&location=london
  // Then query will be "developer" and location will be "london"
  // This is called "destructuring" - it extracts properties from an object
  const { query, location } = req.query;

  // Get the API key from our server's environment variables
  // An API key is like a password that lets us access the external service
  // We store it in environment variables for security (not in the code)
  const API_KEY = process.env.FINDWORK_API_KEY;

  // Check if we have an API key - if not, we can't proceed
  if (!API_KEY) {
    // Send back an error response with HTTP status code 500
    // Status codes: 200s = success, 400s = client error, 500s = server error
    return res
      .status(500) // 500 means "Internal Server Error"
      .json({ error: "API key is missing. Please set it in .env.local." });
  }

  // Try-catch blocks help us handle errors gracefully
  // If anything goes wrong inside the "try" part, it jumps to the "catch" part
  try {
    /**
     * Building the Search URL
     * 
     * Here we create a proper URL with search parameters.
     * Think of it like filling out a form on a search website.
     */
    // The URL object helps us build and manipulate URLs
    // Instead of manually adding "?query=developer&location=london" to the URL,
    // we use this object to build it correctly and safely
    const url = new URL(API_URL);
    
    // Add the job title/keywords parameter
    // searchParams.append adds a parameter to the URL
    // This turns into something like "?search=developer" at the end of the URL
    url.searchParams.append("search", query);
    
    // Add the location parameter
    // This adds "&location=london" to the URL
    url.searchParams.append("location", location);
    
    /**
     * Sending the Request to FindWork.dev
     * 
     * Now we actually contact the external job search service.
     * This is like calling them on the phone to ask for job listings.
     */
    // The fetch function sends an HTTP request to another server
    // It returns a Promise, so we use "await" to wait for the response
    const response = await fetch(url, {
      method: "GET", // GET means we're requesting data (not sending/updating it)
      headers: {
        // Headers are like extra information sent with the request
        // This header includes our API key for authentication
        Authorization: `Token ${API_KEY}`,
        // This header tells the server we want the response in JSON format
        "Content-Type": "application/json",
      },
    });

    // Check if the request was successful
    // response.ok is true for HTTP status codes in the 200-299 range
    if (!response.ok) {
      // If something went wrong, throw an error
      // When we throw an error in a try block, it jumps to the catch block
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    // Parse the JSON response into a JavaScript object
    // JSON is a text format that looks like JavaScript objects
    // This converts that text into actual objects we can work with
    const data = await response.json();

    /**
     * Processing and Returning Results
     * 
     * Now we check if we got any job listings and send them back to the user.
     */
    // Check if the data contains job results
    if (data && data.results) {
      // If we have results, send them back with status 200 (OK)
      // res.json automatically converts JavaScript objects to JSON text
      res.status(200).json(data.results);
    } else {
      // If no jobs were found, send a 404 response (Not Found)
      res.status(404).json({ message: "No jobs found for the given criteria." });
    }
  } catch (error) {
    /**
     * Error Handling
     * 
     * If anything went wrong in the try block, we end up here.
     * This lets us handle errors gracefully instead of crashing.
     */
    // Log the error details to the server console for debugging
    // This won't be visible to the user, only to the developers
    console.error("Error fetching jobs from Findwork API:", error.message);
    
    // Send a user-friendly error message
    // We don't expose the actual error details to the user (for security)
    res.status(500).json({ error: "Failed to fetch job data." });
  }
}
