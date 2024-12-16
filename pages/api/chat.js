export default async function handler(req, res) {
    // Destructure formData from the request body
    const { formData } = req.body;

    // Check if formData exists
    if (!formData) {
        return res.status(400).json({ error: 'Form data is required' });
    }

    
    //Formats the experience array for chatgpt.  
    //Iterates through each experience using `.map()` to format fields, defaulting to "N/A" for missing values.  
    //index +1 cause might help chatgpt read it
    const formattedExperience = formData.experience
        .map(
            (exp, index) => `
            ${index + 1}. Title: ${exp.title || 'N/A'}       
               Company: ${exp.company || 'N/A'}             
               Start Date: ${exp.startDate || 'N/A'}        
               End Date: ${exp.endDate || 'N/A'}            
               Responsibilities: ${exp.responsibilities || 'N/A'} 
            `
        )
        .join('\n'); // Join the array entries with line breaks

    // same for education 
    const formattedEducation = formData.education
        .map(
            (edu, index) => `
            ${index + 1}. Degree: ${edu.degree || 'N/A'}    
               Institution: ${edu.institution || 'N/A'}    
               Graduation Date: ${edu.graduationDate || 'N/A'} 
            `
        )
        .join('\n'); // Join the array entries into a single formatted string with line breaks

    try {
        // ChatGPT promt
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

        Make sure to highlight strengths and expand upon the details provided.`; // A clear, structured prompt for the AI

        // Send the prompt to OpenAI's Chat Completion API endpoint
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST', // HTTP POST request to the API
            headers: {
                'Content-Type': 'application/json', // The request body contains JSON data
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, //API key in my env file
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Model, 4o works well and is cheap
                messages: [{ role: 'user', content: detailedPrompt }], // The prompt sent to the AI
                max_tokens: 1000, // Limit token
            }),
        });

        // If the API response is not successful, throw an error with the status
        if (!response.ok) {
            const errorDetail = await response.json(); // Get error details from the response
            console.error('OpenAI API Error Details:', errorDetail);
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        // Parse the response JSON 
        const data = await response.json();
        const botResponse = data.choices[0].message.content; // Accesses the AI's message content, got this from documentation

        // Send CV back to the frontend as JSON
        res.status(200).json({ response: botResponse });
    } catch (error) {
        // Handle any errors that occur during the request or response
        console.error('Error fetching from OpenAI:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from OpenAI', details: error.message });
    }
}
