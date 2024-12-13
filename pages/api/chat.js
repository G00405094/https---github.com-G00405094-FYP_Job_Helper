export default async function handler(req, res) {
    const { formData } = req.body;

    if (!formData) {
        return res.status(400).json({ error: 'Form data is required' });
    }

    // Format experience and education arrays
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
        .join('\n');

    const formattedEducation = formData.education
        .map(
            (edu, index) => `
            ${index + 1}. Degree: ${edu.degree || 'N/A'}
               Institution: ${edu.institution || 'N/A'}
               Graduation Date: ${edu.graduationDate || 'N/A'}
            `
        )
        .join('\n');

    try {
        const detailedPrompt = `You are a professional CV writer. Create a polished and professional CV based on the following details:
        
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        LinkedIn: ${formData.linkedin}
        Objective: ${formData.objective}
        Skills: ${formData.skills}
        Certifications: ${formData.certifications}
        Hobbies: ${formData.hobbies}

        Experience:
        ${formattedExperience || 'No experience provided'}

        Education:
        ${formattedEducation || 'No education provided'}

        Make sure to highlight strengths and expand upon the details provided.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: detailedPrompt }],
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorDetail = await response.json();
            console.error('OpenAI API Error Details:', errorDetail);
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        res.status(200).json({ response: botResponse });
    } catch (error) {
        console.error('Error fetching from OpenAI:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from OpenAI', details: error.message });
    }
}