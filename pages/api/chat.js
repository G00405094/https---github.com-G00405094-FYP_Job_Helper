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
 * Template-specific formatting functions that structure the CV content
 * according to different visual styles.
 */
const formatForTemplate = {
    // Professional template - formal, traditional styling
    professional: (content, candidateName) => {
        // Structure the raw CV content with appropriate HTML for professional styling
        const sections = parseRawCV(content);
        
        const htmlContent = `
            <div class="cv-document professional-template">
                <header class="header">
                    <h1>${sections.name || candidateName}</h1>
                    <div class="contact-info">
                        ${sections.email ? `<div>${sections.email}</div>` : ''}
                        ${sections.phone ? `<div>${sections.phone}</div>` : ''}
                        ${sections.linkedin ? `<div>${sections.linkedin}</div>` : ''}
                    </div>
                </header>
                
                ${sections.summary ? `
                <div class="section">
                    <h2>Professional Summary</h2>
                    <div>${sections.summary}</div>
                </div>` : ''}
                
                ${sections.skills ? `
                <div class="section">
                    <h2>Skills</h2>
                    <div>${sections.skills}</div>
                </div>` : ''}
                
                ${sections.experience ? `
                <div class="section">
                    <h2>Experience</h2>
                    ${sections.experience}
                </div>` : ''}
                
                ${sections.education ? `
                <div class="section">
                    <h2>Education</h2>
                    ${sections.education}
                </div>` : ''}
                
                ${sections.certifications ? `
                <div class="section">
                    <h2>Certifications</h2>
                    <div>${sections.certifications}</div>
                </div>` : ''}
                
                ${sections.interests ? `
                <div class="section">
                    <h2>Interests & Activities</h2>
                    <div>${sections.interests}</div>
                </div>` : ''}
            </div>
        `;
        
        return {
            formattedContent: htmlContent,
            rawContent: content,
            documentTitle: `${candidateName.replace(/\s+/g, "_")}_Professional_CV`
        };
    },

    // Creative template - modern, design-oriented styling
    creative: (content, candidateName) => {
        // Structure the raw CV content with appropriate HTML for creative styling
        const sections = parseRawCV(content);
        
        const htmlContent = `
            <div class="cv-document creative-template">
                <header class="header">
                    <h1>${sections.name || candidateName}</h1>
                    <div class="contact-info">
                        ${sections.email ? `<div>${sections.email}</div>` : ''}
                        ${sections.phone ? `<div>${sections.phone}</div>` : ''}
                        ${sections.linkedin ? `<div>${sections.linkedin}</div>` : ''}
                    </div>
                </header>
                
                ${sections.summary ? `
                <div class="section">
                    <h2>Professional Summary</h2>
                    <div>${sections.summary}</div>
                </div>` : ''}
                
                ${sections.skills ? `
                <div class="section">
                    <h2>Skills</h2>
                    <div>${sections.skills}</div>
                </div>` : ''}
                
                ${sections.experience ? `
                <div class="section">
                    <h2>Experience</h2>
                    ${sections.experience}
                </div>` : ''}
                
                ${sections.education ? `
                <div class="section">
                    <h2>Education</h2>
                    ${sections.education}
                </div>` : ''}
                
                ${sections.certifications ? `
                <div class="section">
                    <h2>Certifications</h2>
                    <div>${sections.certifications}</div>
                </div>` : ''}
                
                ${sections.interests ? `
                <div class="section">
                    <h2>Interests & Activities</h2>
                    <div>${sections.interests}</div>
                </div>` : ''}
            </div>
        `;
        
        return {
            formattedContent: htmlContent,
            rawContent: content,
            documentTitle: `${candidateName.replace(/\s+/g, "_")}_Creative_CV`
        };
    },

    // Technical template - skills-focused styling
    technical: (content, candidateName) => {
        // Structure the raw CV content with appropriate HTML for technical styling
        const sections = parseRawCV(content);
        
        const htmlContent = `
            <div class="cv-document technical-template">
                <header class="header">
                    <h1>${sections.name || candidateName}</h1>
                    <div class="contact-info">
                        ${sections.email ? `<div>${sections.email}</div>` : ''}
                        ${sections.phone ? `<div>${sections.phone}</div>` : ''}
                        ${sections.linkedin ? `<div>${sections.linkedin}</div>` : ''}
                    </div>
                </header>
                
                ${sections.summary ? `
                <div class="section">
                    <h2>Professional Summary</h2>
                    <div>${sections.summary}</div>
                </div>` : ''}
                
                ${sections.skills ? `
                <div class="section">
                    <h2>Skills</h2>
                    <div>${sections.skills}</div>
                </div>` : ''}
                
                ${sections.experience ? `
                <div class="section">
                    <h2>Experience</h2>
                    ${sections.experience}
                </div>` : ''}
                
                ${sections.education ? `
                <div class="section">
                    <h2>Education</h2>
                    ${sections.education}
                </div>` : ''}
                
                ${sections.certifications ? `
                <div class="section">
                    <h2>Certifications</h2>
                    <div>${sections.certifications}</div>
                </div>` : ''}
                
                ${sections.interests ? `
                <div class="section">
                    <h2>Interests & Activities</h2>
                    <div>${sections.interests}</div>
                </div>` : ''}
            </div>
        `;
        
        return {
            formattedContent: htmlContent,
            rawContent: content,
            documentTitle: `${candidateName.replace(/\s+/g, "_")}_Technical_CV`
        };
    },

    // Minimalist template - clean, simple styling
    minimalist: (content, candidateName) => {
        // Structure the raw CV content with appropriate HTML for minimalist styling
        const sections = parseRawCV(content);
        
        const htmlContent = `
            <div class="cv-document minimalist-template">
                <header class="header">
                    <h1>${sections.name || candidateName}</h1>
                    <div class="contact-info">
                        ${sections.email ? `<div>${sections.email}</div>` : ''}
                        ${sections.phone ? `<div>${sections.phone}</div>` : ''}
                        ${sections.linkedin ? `<div>${sections.linkedin}</div>` : ''}
                    </div>
                </header>
                
                ${sections.summary ? `
                <div class="section">
                    <h2>Professional Summary</h2>
                    <div>${sections.summary}</div>
                </div>` : ''}
                
                ${sections.skills ? `
                <div class="section">
                    <h2>Skills</h2>
                    <div>${sections.skills}</div>
                </div>` : ''}
                
                ${sections.experience ? `
                <div class="section">
                    <h2>Experience</h2>
                    ${sections.experience}
                </div>` : ''}
                
                ${sections.education ? `
                <div class="section">
                    <h2>Education</h2>
                    ${sections.education}
                </div>` : ''}
                
                ${sections.certifications ? `
                <div class="section">
                    <h2>Certifications</h2>
                    <div>${sections.certifications}</div>
                </div>` : ''}
                
                ${sections.interests ? `
                <div class="section">
                    <h2>Interests & Activities</h2>
                    <div>${sections.interests}</div>
                </div>` : ''}
            </div>
        `;
        
        return {
            formattedContent: htmlContent,
            rawContent: content,
            documentTitle: `${candidateName.replace(/\s+/g, "_")}_Minimalist_CV`
        };
    }
};

/**
 * Parse the raw CV content into structured sections
 * This function identifies common CV section patterns and converts them to HTML
 */
function parseRawCV(content) {
    // Initialize section objects
    const sections = {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        summary: '',
        skills: '',
        experience: '',
        education: '',
        certifications: '',
        interests: ''
    };
    
    // Split content by lines to process each section
    const lines = content.split('\n');
    
    // Basic regex patterns for section headers
    const sectionPatterns = {
        name: /^([A-Z\s]+)$/,
        contact: /^(Email:|Phone:|LinkedIn:|Contact:)/i,
        summary: /^(PROFESSIONAL\s*SUMMARY|SUMMARY|OBJECTIVE)/i,
        skills: /^(SKILLS|TECHNICAL SKILLS|KEY SKILLS)/i,
        experience: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)/i,
        education: /^(EDUCATION|ACADEMIC BACKGROUND)/i,
        certifications: /^(CERTIFICATIONS|CERTIFICATES|QUALIFICATIONS)/i,
        interests: /^(INTERESTS|HOBBIES|ACTIVITIES)/i
    };
    
    // Track current section being processed
    let currentSection = null;
    let experienceHtml = '';
    let educationHtml = '';
    
    // Process each line to identify sections and content
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check for contact information
        if (line.match(/^Email:/i)) {
            sections.email = line.replace(/^Email:\s*/i, '').trim();
            continue;
        }
        if (line.match(/^Phone:/i)) {
            sections.phone = line.replace(/^Phone:\s*/i, '').trim();
            continue;
        }
        if (line.match(/^LinkedIn:/i)) {
            sections.linkedin = line.replace(/^LinkedIn:\s*/i, '').trim();
            continue;
        }
        
        // Check for name (usually at the top)
        if (i < 3 && line.match(/^[A-Z\s]{2,}$/) && !sections.name) {
            sections.name = line;
            continue;
        }
        
        // Check for section headers
        if (line.match(sectionPatterns.summary)) {
            currentSection = 'summary';
            continue;
        } else if (line.match(sectionPatterns.skills)) {
            currentSection = 'skills';
            continue;
        } else if (line.match(sectionPatterns.experience)) {
            currentSection = 'experience';
            continue;
        } else if (line.match(sectionPatterns.education)) {
            currentSection = 'education';
            continue;
        } else if (line.match(sectionPatterns.certifications)) {
            currentSection = 'certifications';
            continue;
        } else if (line.match(sectionPatterns.interests)) {
            currentSection = 'interests';
            continue;
        }
        
        // Process content based on current section
        if (currentSection === 'summary') {
            sections.summary += `<p>${line}</p>`;
        } else if (currentSection === 'skills') {
            // Convert bullet points or comma-separated lists to HTML
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                sections.skills += `<ul><li>${line.substring(1).trim()}</li></ul>`;
            } else if (line.includes(',')) {
                const skillsList = line.split(',').map(skill => `<li>${skill.trim()}</li>`).join('');
                sections.skills += `<ul>${skillsList}</ul>`;
            } else {
                sections.skills += `<p>${line}</p>`;
            }
        } else if (currentSection === 'experience') {
            // Look for job titles and companies (often contains | or at or -) 
            if (line.match(/(.+)(\||at|-|–)(.+)/i) && !line.match(/^•|-|\*/)) {
                // Start a new experience entry
                experienceHtml += `<div class="experience-entry">
                                    <h3>${line}</h3>`;
            } else if (line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)/i)) {
                // Dates line
                experienceHtml += `<div class="dates">${line}</div>`;
            } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                // Bullet points
                experienceHtml += `<ul><li>${line.substring(1).trim()}</li></ul>`;
            } else {
                // Regular text
                experienceHtml += `<p>${line}</p>`;
            }
            
            // Check if next line is a new section to close experience entry
            if (i < lines.length - 1) {
                const nextLine = lines[i+1].trim();
                if (
                    nextLine.match(sectionPatterns.education) || 
                    nextLine.match(sectionPatterns.certifications) || 
                    nextLine.match(sectionPatterns.interests)
                ) {
                    experienceHtml += `</div>`;
                }
            }
        } else if (currentSection === 'education') {
            // Look for degree and institution patterns
            if (line.match(/(.+)(\||at|-|–)(.+)/i) && !line.match(/^•|-|\*/)) {
                // Start a new education entry
                educationHtml += `<div class="education-entry">
                                   <h3>${line}</h3>`;
            } else if (line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)/i) || 
                       line.match(/\d{4}/) || 
                       line.match(/graduated/i)) {
                // Graduation date or year
                educationHtml += `<div class="dates">${line}</div>`;
            } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                // Bullet points
                educationHtml += `<ul><li>${line.substring(1).trim()}</li></ul>`;
            } else {
                // Regular text
                educationHtml += `<p>${line}</p>`;
            }
            
            // Check if next line is a new section to close education entry
            if (i < lines.length - 1) {
                const nextLine = lines[i+1].trim();
                if (
                    nextLine.match(sectionPatterns.certifications) || 
                    nextLine.match(sectionPatterns.interests)
                ) {
                    educationHtml += `</div>`;
                }
            }
        } else if (currentSection === 'certifications') {
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                sections.certifications += `<ul><li>${line.substring(1).trim()}</li></ul>`;
            } else {
                sections.certifications += `<p>${line}</p>`;
            }
        } else if (currentSection === 'interests') {
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                sections.interests += `<ul><li>${line.substring(1).trim()}</li></ul>`;
            } else {
                sections.interests += `<p>${line}</p>`;
            }
        }
    }
    
    // Assign processed HTML content
    sections.experience = experienceHtml;
    sections.education = educationHtml;
    
    return sections;
}

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
    // Extract formData and template selection from the request body
    const { formData, template = 'professional' } = req.body;

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
         * Enhanced OpenAI Prompt Construction
         * 
         * Creates a highly detailed prompt string that instructs the OpenAI model on 
         * exactly how to generate a professional CV with specific formatting guidelines.
         */
        const detailedPrompt = `
You are an elite CV writer with 15+ years of experience creating professionally formatted CVs/resumes that pass ATS systems and impress hiring managers.
        
## CANDIDATE INFORMATION
        Name: ${formData.name || 'N/A'}
        Email: ${formData.email || 'N/A'}
        Phone: ${formData.phone || 'N/A'}
        LinkedIn: ${formData.linkedin || 'N/A'}
        Objective: ${formData.objective || 'N/A'}
        Skills: ${formData.skills || 'N/A'}
        Certifications: ${formData.certifications || 'N/A'}
Hobbies & Interests: ${formData.hobbies || 'N/A'}

## EXPERIENCE
        ${formattedExperience || 'No experience provided'}

## EDUCATION
        ${formattedEducation || 'No education provided'}

## TEMPLATE STYLE: ${template.toUpperCase()}

## PROFESSIONAL CV GUIDELINES

1. HEADER & CONTACT INFORMATION
   - Present name prominently at the top (18-22pt font equivalent)
   - Display contact details in a clean, organized format
   - Include only essential information (email, phone, LinkedIn, optional location)
   - Ensure information is correctly formatted (phone numbers with proper spacing, email in lowercase)

2. PROFESSIONAL SUMMARY (3-5 lines)
   - Create a powerful opening paragraph summarizing key qualifications and value proposition
   - Tailor to highlight most relevant experience and skills
   - Use keywords relevant to the candidate's field
   - Present in third person without personal pronouns (no "I" or "my")
   - Include 1-2 quantifiable achievements if information is available
   - Focus on what candidate can offer, not what they want

3. SKILLS SECTION
   - Organize skills logically by category or relevance
   - List technical skills first, followed by soft skills
   - Present 8-12 most relevant skills based on provided information
   - Use industry-standard terminology and avoid abbreviations unless common in field
   - Group skills in a scannable format with clear visual organization

4. EXPERIENCE SECTION
   - Expand bullet points into achievement-oriented statements
   - Begin each bullet with a strong action verb (Managed, Developed, Led, etc.)
   - Emphasize results and impact over routine responsibilities
   - Include metrics and quantifiable achievements wherever possible:
     - Percentages, numbers, dollar figures, timeframes
     - Team sizes, project scopes, budgets when applicable
   - Use past tense for previous roles, present tense for current position
   - Maintain consistent formatting throughout
   - Demonstrate progression in responsibilities if multiple roles
   - Expand on implied achievements that showcase relevant skills
   - 4-6 bullet points per role, focusing on most relevant responsibilities

5. EDUCATION SECTION
   - Present in reverse chronological order
   - Include degree, institution, and graduation date
   - List relevant coursework, honors, or academic achievements if available
   - Maintain parallel structure with other sections
   - Integrate education appropriately based on career stage (more detail for recent graduates)

6. OPTIONAL SECTIONS (based on provided information)
   - Certifications: List with acquisition dates when available
   - Interests/Hobbies: Only include if they demonstrate relevant skills or build rapport
   - Other achievements: Awards, publications, or professional affiliations

7. FORMATTING REQUIREMENTS
   - Format the CV with proper SECTION HEADERS in all caps like "EXPERIENCE", "EDUCATION", etc.
   - Use professional plain text formatting that can be easily converted to HTML later
   - Organize into clear sections with appropriate spacing
   - Structure the document to be easily parsed by automated systems
   - Use clear section markers and bullet points with standard characters (*, -, •)
   - Format job titles and companies with a separator like " | " or " at "
   - Format dates consistently (Month Year format preferred)

## SPECIAL INSTRUCTIONS
- Use PLAIN TEXT formatting with section headers in ALL CAPS
- Convert responsibilities into achievement statements wherever possible
- Begin sentences with action verbs (Managed, Led, Developed, Created, etc.)
- Avoid first-person pronouns entirely (no "I", "me", "my")
- Eliminate generic phrases (e.g., "responsible for")
- Use clean, professional language without jargon unless industry-specific
- Include relevant keywords for ATS optimization
- Eliminate redundancy and unnecessary words
- Demonstrate progression and growth when possible
- Format all dates consistently (Month Year format preferred)
- Ensure all content is factual - enhance but never fabricate
- Structure the document with clear sections and bullet points for easy parsing

Output the complete CV in a clean, structured plain text format with clear section headers and consistent formatting.
`;

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
                messages: [
                    {
                        role: 'system',
                        content: 'You are an elite professional CV writer with expertise in creating ATS-optimized CVs that stand out to hiring managers. You create polished, achievement-oriented documents that highlight a candidate\'s strengths while maintaining factual accuracy.'
                    },
                    { 
                        role: 'user', 
                        content: detailedPrompt 
                    }
                ],
                temperature: 0.6, // Slightly lower temperature for more consistent output while allowing creativity
                max_tokens: 1500, // Increased max tokens to allow for more comprehensive CV content
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

        // Apply template-specific formatting to the CV content
        const formattedCV = formatForTemplate[template] ? 
            formatForTemplate[template](botResponse, formData.name || 'CV') : 
            formatForTemplate.professional(botResponse, formData.name || 'CV');

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
            formattedCV: formattedCV.formattedContent, // Add the formatted HTML content
            template: template, // Save the template used
            user: user.id // Associate the CV with the current user
        });

        /**
         * Response Handling
         * 
         * Send a successful response back to the client with both the generated CV
         * and the ID of the saved database record.
         */
        res.status(200).json({ 
            response: formattedCV.formattedContent, // Return the formatted HTML content
            rawCV: botResponse, // Return the raw CV text for debugging
            savedCV: savedCV._id,   // Return the MongoDB document ID for future reference
            documentTitle: formattedCV.documentTitle, // Return the document title for file naming
            template: template // Return the template used for frontend reference
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
