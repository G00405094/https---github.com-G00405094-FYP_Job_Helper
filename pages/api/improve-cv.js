import { withSessionRoute, getUserFromSession } from '../../lib/session';

/**
 * API route for generating an improved version of a CV
 * Uses OpenAI API to apply suggestions and create an enhanced version
 * that would score 90+ when run through the grading system
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

    const { originalCV, gradingResults, targetJobTitle } = req.body;
    
    if (!originalCV || !gradingResults) {
      return res.status(400).json({ error: 'CV content and grading results are required' });
    }

    // Analyze sections to identify specific improvement areas
    const weakSections = gradingResults.sections
      .filter(section => section.score < (section.maxScore * 0.8)) // Sections below 80% of max score
      .map(section => ({ 
        name: section.name, 
        score: section.score, 
        maxScore: section.maxScore,
        improvement: (section.maxScore - section.score),
        feedback: gradingResults.sections.find(s => s.name === section.name)?.feedback || ""
      }))
      .sort((a, b) => b.improvement - a.improvement); // Sort by most improvement needed first
      
    // Get specific improvement suggestions related to each weak section
    const sectionSuggestions = {};
    gradingResults.improvementSuggestions.forEach(suggestion => {
      const relevantSection = weakSections.find(section => 
        suggestion.title?.toLowerCase().includes(section.name.toLowerCase()) || 
        suggestion.category?.toLowerCase().includes(section.name.toLowerCase())
      );
      
      if (relevantSection) {
        if (!sectionSuggestions[relevantSection.name]) {
          sectionSuggestions[relevantSection.name] = [];
        }
        sectionSuggestions[relevantSection.name].push(suggestion.details || suggestion.description);
      }
    });

    // Create a comprehensive improvement prompt with enhanced direction
    const improvementPrompt = `
You are an elite CV optimizer with 15+ years of experience writing CVs that pass ATS systems and impress hiring managers. Your task is to transform a CV that received a score of ${gradingResults.overallScore}/100 into one that would score 95+ through significant improvements.

THE CV MUST MAINTAIN THE SAME FACTUAL INFORMATION - same jobs, education, timeframes, and skills that actually appear in the original. You can reword, reorganize, and enhance the presentation, but not invent new qualifications.

##CURRENT EVALUATION
Overall Score: ${gradingResults.overallScore}/100

Section Scores:
${gradingResults.sections.map(section => 
  `- ${section.name}: ${section.score}/${section.maxScore}`
).join('\n')}

##KEY WEAKNESSES
${weakSections.map(section => 
  `${section.name} (${section.score}/${section.maxScore}): ${section.feedback}
   ${sectionSuggestions[section.name] ? 
     `Specific suggestions:\n   - ${sectionSuggestions[section.name].join('\n   - ')}` : ''}`
).join('\n\n')}

##TOP IMPROVEMENT PRIORITIES
${gradingResults.improvementSuggestions.slice(0, 5).map(suggestion => 
  `- ${suggestion.title || suggestion.category}: ${suggestion.details}`
).join('\n')}

${targetJobTitle ? `##TARGET POSITION: "${targetJobTitle}"` : '##GENERAL OPTIMIZATION'}
${targetJobTitle ? `This CV must be precisely tailored for ${targetJobTitle} positions, emphasizing relevant skills and accomplishments.` : 'This CV must be optimized for general high-performance across industries.'}

##TRANSFORMATION REQUIREMENTS

1. PROFESSIONAL SUMMARY (Score Booster)
   - Create a powerful, keyword-rich summary that immediately communicates value
   - Incorporate 2-3 measurable achievements with specific metrics (numbers, percentages, dollar amounts)
   - Include 3-5 of the most relevant skills ${targetJobTitle ? `for ${targetJobTitle} positions` : 'from the CV'}
   - Ensure it's scannable and immediately impactful
   - Keep under 4-5 lines
   - Use strong action verbs and industry-specific terminology
   - Remove any generic or clichéd statements without specific value

2. EXPERIENCE SECTION (Highest Impact Area)
   - Transform every bullet point to follow the "Accomplished [X] as measured by [Y] by doing [Z]" formula
   - Start each bullet with powerful action verbs (no repeats within a job)
   - Add specific metrics, percentages, dollar values, team sizes, etc. (based on information implied in the original)
   - Ensure EVERY bullet demonstrates quantifiable achievements, not just responsibilities
   - Highlight skills and keywords relevant to ${targetJobTitle || 'the target field'}
   - Ensure consistent formatting and proper tense usage (past tense for previous roles, present for current)
   - Use 4-6 bullets per role, prioritizing the most impactful achievements
   - Remove any vague or generic statements that don't demonstrate specific value

3. SKILLS SECTION
   - Create a well-organized, scannable skills section
   - Group skills by category (Technical, Soft, Industry-Specific, etc.)
   - Prioritize skills most relevant to ${targetJobTitle || 'high-demand roles'}
   - Include appropriate skill levels where relevant
   - Incorporate ATS-friendly keywords ${targetJobTitle ? `specifically for ${targetJobTitle} roles` : ''}
   - Use industry-standard terminology that would be recognized by ATS systems
   - Avoid listing generic skills without context (e.g., "communication" without evidence)
   - Ensure at least 15-20 relevant skills are included

4. EDUCATION & CERTIFICATIONS
   - Format consistently with years right-aligned
   - Highlight relevant coursework, projects, or honors
   - Present in reverse chronological order
   - Include any implied certifications or training programs that may be mentioned in the original
   - Add relevant academic achievements if appropriate
   - Use consistent date formatting that matches the experience section

5. FORMAT & STRUCTURE
   - Create clear visual hierarchy with consistent headings
   - Ensure perfect consistency in date formats, bullet styling, etc.
   - Use strategic spacing to make the document scannable
   - Organize sections in order of relevance to ${targetJobTitle || 'the position'}
   - Ensure clean, professional formatting throughout
   - Use consistent punctuation (periods or no periods at the end of bullets)
   - Maintain consistent capitalization throughout
   - Use clean, professional formatting with clear section delineation

6. ADDITIONAL SECTIONS (if applicable)
   - Add appropriate sections for Projects, Publications, Volunteer Work if mentioned
   - Format consistently with other sections
   - Emphasize transferable skills and achievements
   - Ensure these sections reinforce the candidate's value proposition
   - Convert any listed activities into achievement-oriented statements

##STYLE GUIDE
- Every statement must demonstrate value, not just describe
- Use active voice exclusively
- Avoid first-person pronouns entirely
- Eliminate generic soft skills unless substantiated with examples
- Maintain professional tone and language
- Use industry-specific terminology ${targetJobTitle ? `for ${targetJobTitle} roles` : 'where appropriate'}
- Ensure document is clean, consistent, and error-free
- Use powerful, varied action verbs (achieved, delivered, spearheaded, orchestrated, etc.)
- Focus on results and impact, not just responsibilities
- Use parallel structure throughout
- Avoid any buzzwords or clichés that don't add specific value
- Use specific, concrete language over vague generalities

##GUARANTEED HIGH-SCORING ELEMENTS
- Include at least 5-7 quantifiable achievements with specific metrics (%, $, time saved, etc.)
- Ensure skills section contains at least 15-20 relevant skills organized by category
- Create a powerful opening summary that immediately communicates value proposition
- Use industry-specific keywords throughout that will pass ATS screening
- Ensure perfect consistency in formatting, tense, and structure
- Include at least one achievement for every role listed
- Demonstrate progression and growth through career history
- Highlight specific technologies, methodologies, and tools relevant to the industry

##CRITICAL GRADING CRITERIA TO ADDRESS:
- Ensure the CV presents a clear, compelling professional identity
- Demonstrate a track record of measurable achievements, not just responsibilities
- Create a skills section that highlights specific, relevant competencies
- Maintain perfect formatting and presentation throughout
- Use achievement-oriented language that emphasizes results over duties
- Include concrete metrics wherever possible (%, $, timeframes, scope)
- Follow consistent date formatting, bullet styling, and section organization

Original CV to transform:
${originalCV}

OUTPUT INSTRUCTIONS: Provide the completely transformed CV ready for immediate use. Do not include explanations or comments outside the CV content. Review your work thoroughly to ensure it meets ALL of the transformation requirements and would score 95+ in professional grading.
`;

    // First do a quick quality check on the CV with a cheaper model
    const qualityCheckResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a CV analysis expert who identifies the key information in a CV.' 
          },
          { 
            role: 'user', 
            content: `Analyze this CV and extract the key information (job titles, years of experience, key skills, education) that must be preserved in any improvement. Only extract factual information, do not evaluate quality.\n\n${originalCV}` 
          }
        ],
        temperature: 0.3
      })
    });

    if (!qualityCheckResponse.ok) {
      return res.status(qualityCheckResponse.status).json({ 
        error: 'Failed to analyze CV',
      });
    }

    const qualityCheckData = await qualityCheckResponse.json();
    const keyInformation = qualityCheckData.choices[0].message.content.trim();

    // Make request to OpenAI API with enhanced model and parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an elite CV optimization specialist who transforms average CVs into exceptional ones that would score 95+ in professional grading systems while maintaining factual integrity. You focus on powerful achievement-oriented language, quantifiable metrics, and ATS-optimized formatting. Your goal is to create CVs that pass both automated systems and impress human recruiters.' 
          },
          {
            role: 'user',
            content: `Key information that MUST be preserved in the improved CV:\n${keyInformation}\n\n${improvementPrompt}`
          }
        ],
        temperature: 0.3, // Lower for more consistent quality and format
        max_tokens: 4000, // Increased for more comprehensive results
        top_p: 0.9 // More focused quality
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: 'OpenAI API error',
        details: errorData
      });
    }

    const data = await response.json();
    let improvedCV = data.choices[0].message.content.trim();
    
    // Perform quality verification on the improved CV
    const verificationPrompt = `
Verify that this improved CV meets the following quality standards:
1. Contains at least 5 quantifiable achievements with specific metrics
2. Every job has at least 3-4 bullet points with achievements (not just responsibilities)
3. Skills are organized by category with at least 15 relevant skills
4. Contains a powerful professional summary with specific value proposition
5. Has consistent formatting throughout (dates, bullets, tense, capitalization)
6. Maintains all factual information from the original CV (no invented experience)

Original CV key information:
${keyInformation}

Improved CV:
${improvedCV}

Rate each criteria from 1-10 and provide a PASS/FAIL verdict. If the score is below 8 on any criteria, FAIL the CV and explain why.
`;

    const verificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are a strict CV quality control expert who verifies CVs meet professional standards.' 
          },
          { role: 'user', content: verificationPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!verificationResponse.ok) {
      return res.status(200).json({ improvedCV }); // Return the CV even if verification fails
    }

    const verificationData = await verificationResponse.json();
    const verificationResult = verificationData.choices[0].message.content.trim();
    
    // If verification failed, try one more improvement
    if (verificationResult.includes("FAIL")) {
      const fixPrompt = `
The improved CV failed quality verification for these reasons:
${verificationResult}

Please fix these issues while preserving all factual information from the original CV:
${keyInformation}

Current improved CV that needs fixes:
${improvedCV}

Make these specific improvements to meet all quality criteria while preserving factual accuracy:
1. Add more quantifiable achievements with specific metrics
2. Ensure every job has 3-4 achievement-focused bullet points
3. Organize skills by category with at least 15 relevant skills
4. Create a powerful summary with specific value proposition
5. Fix any formatting inconsistencies
6. Maintain all factual information from the original CV
`;

      const fixResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are an elite CV optimization specialist who fixes CVs to meet the highest professional standards.' 
            },
            { role: 'user', content: fixPrompt }
          ],
          temperature: 0.3
        })
      });

      if (fixResponse.ok) {
        const fixData = await fixResponse.json();
        improvedCV = fixData.choices[0].message.content.trim();
      }
    }
    
    // Return the improved CV
    return res.status(200).json({ improvedCV });

  } catch (error) {
    console.error('Error improving CV:', error);
    return res.status(500).json({ 
      error: 'Failed to improve CV',
      message: error.message 
    });
  }
}

export default withSessionRoute(handler); 