import { withSessionRoute, getUserFromSession } from '../../lib/session';

/**
 * API route for grading CV content
 * Uses OpenAI API to analyze CV content and provide a comprehensive grade and feedback
 * Examines different sections of the CV for specific feedback
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const user = await getUserFromSession(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { cvSections, targetJobTitle } = req.body;
    
    if (!cvSections) {
      return res.status(400).json({ error: 'CV content is required' });
    }

    // Initialize results object
    const results = {
      overallScore: 0,
      sections: [],
      improvementSuggestions: []
    };

    // Define weight for each section
    const sectionWeights = {
      summary: 15,      // Professional summary/objective
      experience: 30,    // Work experience descriptions
      education: 15,     // Education and qualifications
      skills: 15,        // Skills and competencies
      certifications: 5, // Certifications
      achievements: 10,  // Achievements and results
      format: 10         // Overall format and presentation
    };

    // Add job title context for targeted evaluation
    const jobTitleContext = targetJobTitle ? 
      `This CV is being evaluated specifically for a "${targetJobTitle}" position. Tailor your feedback to this specific role and industry.` :
      "This CV is being evaluated for general quality and effectiveness.";

    // Grade the overall format and presentation
    const formatPrompt = `
You are an expert CV reviewer who specializes in formatting and presentation. 
Please analyze the following CV and evaluate ONLY its formatting, presentation, and overall structure.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.format} based on these criteria:
- Clear, consistent headings and sections
- Effective use of white space
- Scannable layout that highlights key information
- Professional font choices and sizing
- Logical organization of information
- Consistent formatting of dates, bullet points, etc.
- Appropriate length (typically 1-2 pages)

Do NOT evaluate the content quality, just the presentation.

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.format}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific formatting suggestion 1",
    "specific formatting suggestion 2",
    "specific formatting suggestion 3"
  ]
}

CV to analyze:
${cvSections.fullCV}
`;

    // Grade the professional summary/objective
    const summaryPrompt = `
You are an expert CV reviewer who specializes in professional summaries and objectives.
Please analyze the following CV summary/objective section and evaluate its effectiveness.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.summary} based on these criteria:
- Clear articulation of career goals or professional identity
- Highlights relevant skills and experience${targetJobTitle ? ` for ${targetJobTitle} roles` : ''}
- Tailored to target roles (not generic)
- Concise yet compelling (typically 3-5 lines)
- Free of clichés and buzzwords
- Written in first person implied (no "I" statements)
- Contains quantifiable achievements where possible

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.summary}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2"
  ]
}

CV summary section to analyze:
${cvSections.summary || (cvSections.personal + '\n' + cvSections.other).substring(0, 500)}
`;

    // Grade the work experience descriptions
    const experiencePrompt = `
You are an expert CV reviewer who specializes in work experience descriptions.
Please analyze the following CV experience section and evaluate its effectiveness.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.experience} based on these criteria:
- Uses strong action verbs to start bullet points
- Emphasizes achievements over responsibilities (results, not just tasks)
- Quantifies achievements where possible (%, $, numbers)
- Demonstrates progression and growth
- Highlights experience relevant to ${targetJobTitle || 'target roles'}
- Appropriate level of detail (not too verbose or too sparse)
- Consistent formatting and structure
- Proper use of past/present tense
- Focuses on most recent and relevant experience

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.experience}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific improvement suggestion 1", 
    "specific improvement suggestion 2",
    "specific improvement suggestion 3"
  ]
}

CV experience section to analyze:
${cvSections.experience || cvSections.fullCV}
`;

    // Grade the education section
    const educationPrompt = `
You are an expert CV reviewer who specializes in education sections.
Please analyze the following CV education section and evaluate its effectiveness.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.education} based on these criteria:
- Clear presentation of degrees, institutions, and graduation dates
- Highlights relevant coursework, projects, or academic achievements${targetJobTitle ? ` for ${targetJobTitle} positions` : ''}
- Appropriate level of detail based on career stage
- Strategic positioning (before or after experience based on relevance)
- Includes GPA only if it strengthens the application
- Proper formatting and consistency
- Includes relevant certifications or continuing education

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.education}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2"
  ]
}

CV education section to analyze:
${cvSections.education || cvSections.fullCV}
`;

    // Grade the skills section
    const skillsPrompt = `
You are an expert CV reviewer who specializes in skills sections.
Please analyze the following CV skills section and evaluate its effectiveness.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.skills} based on these criteria:
- Relevant skills for ${targetJobTitle ? `${targetJobTitle} roles` : 'target industry/role'}
- Balanced mix of technical, soft, and domain-specific skills
- Avoids generic skills that don't differentiate the candidate
- Organized in a clear, scannable format
- Demonstrates proficiency levels where appropriate
- Includes keywords relevant to ATS (Applicant Tracking Systems)${targetJobTitle ? ` for ${targetJobTitle} positions` : ''}
- Avoids excessive jargon or acronyms without context

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.skills}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2"
  ]
}

CV skills section to analyze:
${cvSections.skills || cvSections.fullCV}
`;

    // Grade any certifications, achievements, and extras
    const extrasPrompt = `
You are an expert CV reviewer who specializes in evaluating certifications, achievements, and additional sections (projects, volunteer work, etc.).
Please analyze the following CV sections and evaluate their effectiveness.

${jobTitleContext}

Evaluate on a scale of 0-${sectionWeights.certifications + sectionWeights.achievements} based on these criteria:
- Relevant certifications and credentials are highlighted${targetJobTitle ? ` for ${targetJobTitle} roles` : ''}
- Achievements demonstrate tangible impact and results
- Additional sections add value and show well-roundedness
- Information is concise and relevant to career goals
- Strategic inclusion/exclusion of personal information
- Proper formatting and organization

Return your analysis in JSON format as follows:
{
  "score": number (0-${sectionWeights.certifications + sectionWeights.achievements}),
  "feedback": "detailed feedback with specific strengths and weaknesses",
  "improvementSuggestions": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2"
  ]
}

CV sections to analyze:
${(cvSections.certifications || '') + '\n' + (cvSections.achievements || '') + '\n' + (cvSections.projects || '') + '\n' + (cvSections.interests || '')}
`;

    // Structure for all section evaluations
    const sectionPrompts = [
      { name: 'Format & Presentation', prompt: formatPrompt, maxScore: sectionWeights.format },
      { name: 'Professional Summary', prompt: summaryPrompt, maxScore: sectionWeights.summary },
      { name: 'Work Experience', prompt: experiencePrompt, maxScore: sectionWeights.experience },
      { name: 'Education', prompt: educationPrompt, maxScore: sectionWeights.education },
      { name: 'Skills & Competencies', prompt: skillsPrompt, maxScore: sectionWeights.skills },
      { name: 'Certifications & Achievements', prompt: extrasPrompt, maxScore: sectionWeights.certifications + sectionWeights.achievements }
    ];

    // Process each section in parallel
    const sectionResults = await Promise.all(sectionPrompts.map(async section => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a professional CV grading assistant.' },
              { role: 'user', content: section.prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content.trim();
        
        // Parse the JSON response
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(responseText);
        } catch (error) {
          // If not valid JSON, try to extract JSON portion using regex
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Failed to parse response from OpenAI');
          }
        }

        // Add to results
        results.sections.push({
          name: section.name,
          score: jsonResponse.score,
          maxScore: section.maxScore,
          feedback: jsonResponse.feedback
        });

        // Add improvement suggestions if available
        if (jsonResponse.improvementSuggestions && Array.isArray(jsonResponse.improvementSuggestions)) {
          jsonResponse.improvementSuggestions.forEach(suggestion => {
            results.improvementSuggestions.push({
              category: section.name,
              details: suggestion
            });
          });
        }

        return jsonResponse.score;
      } catch (error) {
        console.error(`Error grading ${section.name}:`, error);
        // In case of error, assign a default score for this section
        results.sections.push({
          name: section.name,
          score: Math.floor(section.maxScore / 2), // Default to half the max score
          maxScore: section.maxScore,
          feedback: "Unable to evaluate this section due to a technical error."
        });
        return Math.floor(section.maxScore / 2);
      }
    }));

    // Calculate overall score (sum of all section scores)
    results.overallScore = Math.round(sectionResults.reduce((total, score) => total + score, 0));

    // Get comprehensive analysis and final recommendations
    const finalAnalysisPrompt = `
You are an expert CV reviewer providing final recommendations based on a detailed sectional analysis.
The CV has already been scored in these areas:
${results.sections.map(s => `- ${s.name}: ${s.score}/${s.maxScore} - ${s.feedback.substring(0, 100)}...`).join('\n')}

Total Score: ${results.overallScore}/100

${jobTitleContext}

Based on this analysis, provide 3-5 high-impact, prioritized recommendations that would most improve this CV${targetJobTitle ? ` for ${targetJobTitle} positions` : ''}.
Each recommendation should be specific, actionable, and focused on the weakest areas.

Return your recommendations in JSON format as follows:
{
  "topRecommendations": [
    {
      "title": "Clear, action-oriented title",
      "description": "Detailed explanation with specific examples of how to implement"
    },
    ...
  ]
}

Full CV for reference:
${cvSections.fullCV.substring(0, 1000)}
`;

    // Get final recommendations
    try {
      const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a professional CV grading assistant.' },
            { role: 'user', content: finalAnalysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (finalResponse.ok) {
        const finalData = await finalResponse.json();
        const finalText = finalData.choices[0].message.content.trim();
        
        try {
          const finalJson = JSON.parse(finalText);
          
          // Add top recommendations to the start of the improvement suggestions
          if (finalJson.topRecommendations && Array.isArray(finalJson.topRecommendations)) {
            // Prepend these top recommendations to our improvement suggestions
            results.improvementSuggestions = [
              ...finalJson.topRecommendations.map(rec => ({
                category: 'Top Priority',
                title: rec.title,
                details: rec.description
              })),
              ...results.improvementSuggestions
            ];
          }
        } catch (error) {
          console.error('Error parsing final recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Error getting final recommendations:', error);
    }

    // Return the complete grading results
    return res.status(200).json(results);

  } catch (error) {
    console.error('Error grading CV:', error);
    return res.status(500).json({ 
      error: 'Failed to grade CV',
      message: error.message 
    });
  }
}

export default withSessionRoute(handler); 