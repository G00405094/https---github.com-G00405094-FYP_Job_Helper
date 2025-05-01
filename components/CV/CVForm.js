/**
 * CV Form Component
 * 
 * This component provides a user-friendly form for creating professional CVs.
 * It collects all relevant information (personal details, experience, education),
 * sends it to the AI service, and displays the generated CV.
 * 
 * Technologies:
 * - React: A JavaScript library for building user interfaces
 * - React Hooks: Functions that let you "hook into" React features like state
 * - Fetch API: A modern way to make network requests (like AJAX but better)
 * - CSS Modules: A way to make CSS styles apply only to specific components
 * - Blob API: Used for generating downloadable files in the browser
 */

import React, { useState } from "react";
// CSS Modules let us write CSS that only applies to this component
// The 'classes' object will contain all the styles as properties
import classes from "./styles.module.css";
// Import authentication context for checking user login status
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";
// Import our new components
import CVPreview from "./CVPreview";
import TemplateSelector from "./TemplateSelector";
import CVFormWizard from "./CVFormWizard";
import SmartSuggestions from "./SmartSuggestions";

/**
 * CVForm Component
 * 
 * This component manages the entire CV creation process:
 * 1. Collects user input through form fields
 * 2. Organizes the data into a structured format
 * 3. Sends the data to the AI service
 * 4. Displays and allows downloading the generated CV
 */
function CVForm() {
  // Get authentication state and user info
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  /**
   * React State for Form Data
   * 
   * What is React state? It's like the "memory" of a component that triggers re-rendering
   * when changed. useState() creates a state variable and a function to update it.
   * 
   * Here, we're creating a complex state object with nested data for the entire form.
   */
  const [formData, setFormData] = useState({
    // Personal information
    name: "",           // e.g., "John Doe"
    email: "",          // e.g., "john@example.com"
    phone: "",          // e.g., "555-123-4567"
    linkedin: "",       // e.g., "linkedin.com/in/johndoe"
    objective: "",      // Career goals statement
    
    // Professional details stored as strings
    // (We could use arrays, but strings are simpler for this form)
    skills: "",         // e.g., "JavaScript, React, Node.js"
    certifications: "", // e.g., "AWS Certified Developer, Google Cloud Professional"
    hobbies: "",        // e.g., "Photography, Hiking, Chess"
    
    // Experience is an array of objects because users can have multiple jobs
    // We start with one empty experience object in the array
    experience: [
      {
        title: "",           // e.g., "Software Developer"
        company: "",         // e.g., "Tech Company Inc."
        startDate: "",       // e.g., "2020-01-01"
        endDate: "",         // e.g., "2022-12-31"
        responsibilities: "", // e.g., "Developed web applications using React"
      },
    ],
    
    // Education is also an array of objects for multiple schools/degrees
    education: [
      {
        degree: "",          // e.g., "Bachelor of Computer Science"
        institution: "",     // e.g., "University of Technology"
        graduationDate: "",  // e.g., "2019-05-15"
      },
    ],
  });

  // Additional state for component UI
  const [generatedCV, setGeneratedCV] = useState(""); // Stores the generated CV text
  const [savedCVId, setSavedCVId] = useState(null);  // Stores the MongoDB document ID
  const [isLoading, setIsLoading] = useState(false); // Tracks API request loading state
  const [error, setError] = useState("");            // Stores error messages
  const [authError, setAuthError] = useState(false); // Tracks authentication errors
  const [selectedTemplate, setSelectedTemplate] = useState("professional"); // Template selection

  /**
   * Basic Input Change Handler
   * 
   * This function updates our form state when any input field changes.
   * It uses several important JavaScript concepts:
   * 
   * @param {Event} e - The input change event object from the browser
   */
  const handleInputChange = (e) => {
    // Destructuring assignment - extracts properties from an object into variables
    // This is equivalent to:
    // const name = e.target.name;
    // const value = e.target.value;
    const { name, value } = e.target;
    
    // Update the state using the spread operator (...) and computed property names []
    // The spread operator (...formData) creates a copy of all existing form data
    // The [name]: value syntax dynamically updates just the changed field based on its name
    // This is called "computed property names" - the property name comes from a variable
    setFormData({ 
      ...formData,  // Copy all existing form data first
      [name]: value // Then override just the one field that changed
    });
  };

  /**
   * Experience Field Change Handler
   * 
   * Special handler for updating nested objects within the experience array.
   * This is more complex because we need to:
   * 1. Find the right experience object by index
   * 2. Update just one field within that object
   * 3. Keep all other data unchanged
   * 
   * @param {number} index - Which experience entry to update (0 for first, 1 for second, etc.)
   * @param {string} field - Which field to update (title, company, etc.)
   * @param {string} value - The new value for that field
   */
  const handleExperienceChange = (index, field, value) => {
    // Create a copy of the entire experience array using the spread operator
    // This is important in React to avoid mutating state directly
    const updatedExperience = [...formData.experience];
    
    // Update the specific field in the specific experience object
    // Since updatedExperience is a new array (not the original), this is safe
    updatedExperience[index][field] = value;
    
    // Update the entire form state, replacing only the experience array
    setFormData({ 
      ...formData,                   // Keep all other form data the same
      experience: updatedExperience  // Replace the experience array with our updated version
    });
  };

  /**
   * Education Field Change Handler
   * 
   * Very similar to the experience handler, but for education entries.
   * This demonstrates the pattern for handling nested arrays in React state.
   * 
   * @param {number} index - Which education entry to update
   * @param {string} field - Which field to update (degree, institution, etc.)
   * @param {string} value - The new value for that field
   */
  const handleEducationChange = (index, field, value) => {
    // Copy the education array to avoid mutating state directly
    const updatedEducation = [...formData.education];
    
    // Update the specific field in the specific education object
    updatedEducation[index][field] = value;
    
    // Update the form state with the new education array
    setFormData({ 
      ...formData,                 // Keep all other form data
      education: updatedEducation  // Replace just the education array
    });
  };

  /**
   * Add Experience Entry Handler
   * 
   * Adds a new empty job entry to the experience array.
   * This demonstrates how to add items to an array in React state.
   */
  const addExperience = () => {
    setFormData({
      ...formData,  // Keep all existing form data
      experience: [
        ...formData.experience, // Keep all existing experience entries
        // Add a new empty experience object to the end of the array
        { 
          title: "", 
          company: "", 
          startDate: "", 
          endDate: "", 
          responsibilities: "" 
        },
      ],
    });
  };

  /**
   * Add Education Entry Handler
   * 
   * Adds a new empty education entry to the education array.
   * Very similar pattern to the addExperience function.
   */
  const addEducation = () => {
    setFormData({
      ...formData,  // Keep all existing form data
      education: [
        ...formData.education, // Keep all existing education entries
        // Add a new empty education object to the end of the array
        { 
          degree: "", 
          institution: "", 
          graduationDate: "" 
        },
      ],
    });
  };

  /**
   * Form Submission Handler
   * 
   * This function processes the form submission:
   * 1. Prevents the default browser form submission
   * 2. Checks user authentication
   * 3. Sends the form data to the server via fetch()
   * 4. Updates the state based on the server's response
   * 
   * @param {Event} e - The form submission event from the browser
   */
  const handleSubmit = async (e) => {
    // Prevent the default browser form submission behavior
    // Without this, the page would reload (which we don't want in a React app)
    e.preventDefault();
    
    // Clear any previous error messages
    setError("");
    
    // Check if the user is authenticated (logged in)
    // This is vital for security and data association
    if (!isAuthenticated) {
      setAuthError(true);
      setError("Please log in to generate a CV");
      return;
    }
    
    // Set loading state to true to display a loading indicator
    setIsLoading(true);
    
    try {
      // Send the form data to our API endpoint using the fetch API
      // This is a modern way to make network requests (more powerful than AJAX)
      const response = await fetch("/api/chat", {
        method: "POST",              // HTTP POST method for creating new resources
        headers: {                   // Request headers tell the server what format we're sending
          "Content-Type": "application/json", // We're sending JSON data
        },
        body: JSON.stringify({ formData, template: selectedTemplate }), // Include template selection and wrap in formData object
      });
      
      // Parse the response body as JSON
      // await is necessary because response.json() returns a Promise
      const result = await response.json();
      
      // Check if the request was successful
      if (response.ok) {
        // If successful, update the state with the generated CV and its ID
        setGeneratedCV(result.response);
          setSavedCVId(result.savedCV);
      } else {
        // If the request failed, set an error message from the response
        throw new Error(result.error || "Failed to generate CV");
      }
    } catch (err) {
      // Handle any errors that occurred during the try block
      console.error("Error generating CV:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      // This code runs whether the try succeeded or caught an error
      // Set loading state back to false
      setIsLoading(false);
    }
  };

  /**
   * Render different views based on application state
   */
  const renderContent = () => {
    // Show the CV result if it has been generated
    if (generatedCV) {
      return (
        <div className={classes.generatedCvContainer}>
          <h2 className={classes.generatedCvTitle}>Your Generated CV</h2>
          
          <div className={classes.generatedCvBox}>
            {/* Render CV with HTML formatting instead of as plain text */}
            <div 
              className={`${classes.generatedCvContent} ${classes[`template${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}`]}`}
              dangerouslySetInnerHTML={{ __html: generatedCV }}
            />
          </div>
          
          <div className={classes.actionsContainer}>
            <button 
              type="button" 
              onClick={handleDownload} 
              className={classes.downloadButton}
            >
              Download as Word Document
            </button>
            <button 
              type="button" 
              onClick={handleReset} 
              className={classes.newCvButton}
            >
              Create Another CV
            </button>
          </div>
        </div>
      );
    }
    
    // Otherwise, show the CV form
    return (
      <div className={classes.cvFormLayout}>
        {/* Form Column */}
        <div className={classes.formColumn}>
          <TemplateSelector 
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
          />
          
          <CVFormWizard
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleExperienceChange={handleExperienceChange}
            handleEducationChange={handleEducationChange}
            addExperience={addExperience}
            addEducation={addEducation}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={isLoading}
            error={error}
          />
        </div>
        
        {/* Preview Column */}
        <div className={classes.previewColumn}>
          <h3 className={classes.previewTitle}>Live Preview</h3>
          <CVPreview 
            formData={formData}
            template={selectedTemplate}
          />
        </div>
      </div>
    );
  };

  /**
   * Download Handler
   * 
   * Creates a downloadable Word document from the generated CV with proper template styling.
   */
  const handleDownload = () => {
    if (!generatedCV) return;

    // Create a Word document in HTML format that can be opened by Microsoft Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${formData.name || 'CV'} - ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} CV</title>
        <style>
          /* Base styles for all templates */
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.5;
            margin: 1in;
            color: #333;
          }
          h1 {
            font-size: 24pt;
            margin-bottom: 5px;
          }
          h2 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
          }
          p {
            margin: 8px 0;
          }
          .header {
            margin-bottom: 20px;
          }
          .contact-info {
            margin-bottom: 15px;
          }
          .section {
            margin-bottom: 20px;
          }
          ul {
            margin-top: 5px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          
          /* Professional template styling */
          ${selectedTemplate === 'professional' ? `
            body {
              font-family: 'Times New Roman', serif;
              color: #000;
            }
            h1 {
              color: #14213d;
              border-bottom: 2pt solid #14213d;
              padding-bottom: 5pt;
            }
            h2 {
              color: #14213d;
              border-bottom: 1pt solid #14213d;
            }
            .contact-info {
              text-align: left;
              font-style: normal;
            }
            .section {
              margin-top: 12pt;
            }
            .experience-entry, .education-entry {
              margin-bottom: 15pt;
            }
            h3 {
              font-size: 12pt;
              color: #14213d;
              margin-bottom: 5pt;
              margin-top: 10pt;
            }
            .dates {
              font-style: italic;
              margin-bottom: 5pt;
            }
          ` : ''}
          
          /* Creative template styling */
          ${selectedTemplate === 'creative' ? `
            body {
              font-family: 'Calibri', 'Segoe UI', sans-serif;
              margin: 0.8in;
            }
            h1 {
              color: #bc6c25;
              font-size: 28pt;
              text-transform: uppercase;
              letter-spacing: 2pt;
            }
            h2 {
              color: #bc6c25;
              border-bottom: 1.5pt solid #dda15e;
              text-transform: uppercase;
              letter-spacing: 1pt;
            }
            .header {
              background-color: #fefae0;
              padding: 20pt;
              margin: -0.8in -0.8in 20pt -0.8in;
            }
            .contact-info {
              color: #606c38;
            }
            .section {
              padding-left: 5pt;
            }
            .experience-entry, .education-entry {
              margin-bottom: 15pt;
              border-left: 3pt solid #dda15e;
              padding-left: 8pt;
            }
            h3 {
              font-size: 12pt;
              color: #bc6c25;
              margin-bottom: 5pt;
              margin-top: 10pt;
            }
            .dates {
              color: #606c38;
              margin-bottom: 5pt;
            }
            ul {
              list-style-type: square;
              color: #606c38;
            }
            li span {
              color: #333;
            }
          ` : ''}
          
          /* Technical template styling */
          ${selectedTemplate === 'technical' ? `
            body {
              font-family: 'Consolas', 'Courier New', monospace;
              margin: 1in;
              background-color: #f8f9fa;
            }
            h1 {
              color: #2a9d8f;
              font-size: 22pt;
              border-bottom: none;
            }
            h2 {
              color: #2a9d8f;
              border-bottom: 1pt solid #2a9d8f;
              text-transform: uppercase;
              font-size: 13pt;
            }
            .section {
              padding-left: 15pt;
              border-left: 3pt solid #e9c46a;
              margin-left: 5pt;
            }
            .experience-entry, .education-entry {
              margin-bottom: 15pt;
              border-bottom: 1pt dotted #e9c46a;
              padding-bottom: 8pt;
            }
            h3 {
              font-size: 12pt;
              color: #2a9d8f;
              margin-bottom: 5pt;
              margin-top: 10pt;
            }
            .dates {
              font-family: 'Calibri', sans-serif;
              color: #264653;
              margin-bottom: 5pt;
            }
            .contact-info {
              font-family: 'Calibri', sans-serif;
              color: #264653;
            }
            ul {
              list-style-type: none;
              padding-left: 15pt;
            }
            ul li:before {
              content: ">";
              color: #2a9d8f;
              font-weight: bold;
              display: inline-block;
              width: 15pt;
              margin-left: -15pt;
            }
          ` : ''}
          
          /* Minimalist template styling */
          ${selectedTemplate === 'minimalist' ? `
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 1.5in;
              color: #333;
              font-weight: 300;
            }
            h1 {
              font-weight: 300;
              font-size: 26pt;
              color: #333;
              text-transform: uppercase;
              letter-spacing: 3pt;
            }
            h2 {
              font-weight: 300;
              color: #555;
              border-bottom: none;
              letter-spacing: 1pt;
              text-transform: uppercase;
            }
            .section {
              margin-bottom: 25pt;
            }
            .experience-entry, .education-entry {
              margin-bottom: 20pt;
            }
            h3 {
              font-size: 12pt;
              font-weight: 400;
              color: #333;
              margin-bottom: 5pt;
              margin-top: 15pt;
              letter-spacing: 0.5pt;
            }
            .dates {
              color: #777;
              margin-bottom: 5pt;
              font-size: 10pt;
            }
            .contact-info {
              color: #777;
              font-size: 10pt;
              text-transform: uppercase;
              letter-spacing: 1pt;
            }
            ul {
              list-style-type: none;
              padding-left: 0;
            }
            p {
              line-height: 1.7;
            }
          ` : ''}
        </style>
      </head>
      <body>
        ${generatedCV}
      </body>
      </html>
    `;

    // Create a Blob with HTML content
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element for downloading
    const a = document.createElement("a");
    a.href = url;
    
    // Set the file name with appropriate extension
    a.download = `${formData.name.replace(/\s+/g, "_")}_${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}_CV.doc`;
    
    // Programmatically click the anchor to trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  /**
   * Template Selection Handler
   * 
   * Updates the selected CV template
   * 
   * @param {string} templateId - The ID of the selected template
   */
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  /**
   * New Form Reset Handler
   * 
   * Resets the form to create a new CV
   */
  const handleReset = () => {
    setGeneratedCV("");
    setSavedCVId(null);
    // Reset to default form state
    setFormData({
      name: "", 
      email: "", 
      phone: "", 
      linkedin: "", 
      objective: "",
      skills: "", 
      certifications: "", 
      hobbies: "",
      experience: [{ title: "", company: "", startDate: "", endDate: "", responsibilities: "" }],
      education: [{ degree: "", institution: "", graduationDate: "" }]
    });
  };

  // Show a login prompt if user is not authenticated
  if (authError) {
  return (
      <div className={classes.authErrorContainer}>
        <h2>Authentication Required</h2>
        <p>Please log in to generate and save CVs.</p>
        <button
          type="button"
          onClick={() => router.push("/auth/login?callback=/")}
          className={classes.loginButton}
        >
          Log In
        </button>
          </div>
    );
  }

  // Main component rendering
  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Create Your Professional CV</h1>
      
      {error && (
        <div className={classes.errorAlert}>
          <p>{error}</p>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}

export default CVForm;
