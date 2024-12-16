import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Exported API route handler for handling HTTP requests
export default async function handler(req, res) {
  // Check if the request method is POST
  if (req.method === 'POST') {
    // Extract the "company" value from the request body
    const { company } = req.body;

    // Return an error response if the company name is missing
    if (!company) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    try {
      // Create a prompt asking for interview questions and process for the given company
      const prompt = `What are the most common interview questions and interview process details for ${company}?`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // gpt model
        messages: [{ role: 'user', content: prompt }], // Pass the prompt as a user message
        temperature: 0.7, // Controls creativity of the response (higher is more random)
        max_tokens: 500, // Limit the response length to 500 tokens
      });

      // Extract the content of the response from OpenAI's API
      const answer = response.choices[0].message.content.trim();

      // Send a success response with the generated answer
      res.status(200).json({ response: answer });
    } catch (error) {
      // Log any errors that occur during the OpenAI API request
      console.error('OpenAI API error:', error.message);

      // Return an error response with a 500 status code
      res.status(500).json({ error: 'Failed to fetch interview information.' });
    }
  } else {
    // If the request method is not POST, set the allowed methods to POST
    res.setHeader('Allow', ['POST']);

    // Return a 405 error (Method Not Allowed)
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
