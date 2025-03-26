import dbConnect from '../../lib/mongodb';
import CV from '../../models/CV';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cvId, jobTitle, company, jobDescription, location } = req.body;

  if (!cvId || !jobTitle || !company) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Fetch the selected CV
    const cv = await CV.findById(cvId);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Format CV data for the AI prompt
    const experienceString = cv.experience
      .map(exp => `${exp.title} at ${exp.company} (${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'})`)
      .join(', ');
    
    const skillsString = cv.skills || 'N/A';
    
    // Create prompt for OpenAI
    const prompt = `
      You are a professional cover letter writer. Create a tailored cover letter for the following job:
      
      Job Title: ${jobTitle}
      Company: ${company}
      Location: ${location || 'Not specified'}
      
      ${jobDescription 
        ? `Job Description: ${jobDescription}` 
        : `This is for a ${jobTitle} position at ${company}. Since we don't have a full job description, 
          focus on general skills and experiences relevant for this role and company. Research common 
          responsibilities for this position and tailor the letter accordingly.`
      }
      
      Using details from this CV:
      Name: ${cv.name}
      Experience: ${experienceString}
      Skills: ${skillsString}
      
      Write a personalized cover letter that highlights relevant experience and skills for this specific job.
      The tone should be professional but engaging. Keep it under 400 words.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      console.error('OpenAI API Error Details:', errorDetail);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const coverLetter = data.choices[0].message.content;

    // Return the generated cover letter
    res.status(200).json({ coverLetter });
    
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ 
      error: 'Failed to generate cover letter', 
      details: error.message 
    });
  }
} 