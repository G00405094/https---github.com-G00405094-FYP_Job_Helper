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
        // Add a new empty education object
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
   * This function runs when the user clicks the "Generate CV" button.
   * It shows several important concepts:
   * - async/await: A cleaner way to work with Promises (asynchronous operations)
   * - try/catch: How to handle errors in JavaScript
   * - fetch API: How to send data to a server
   * 
   * @param {Event} e - The form submission event from the browser
   */
  const handleSubmit = async (e) => {
    // prevent the default form submission (which would refresh the page)
    // This is important because we want to handle the submission with JavaScript
    e.preventDefault();
    
    // Clear any previous errors and reset state
    setError("");
    setAuthError(false);

    // Check if user is authenticated before proceeding
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      setAuthError(true);
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }
    
    // Set loading state to show the user something is happening
    setIsLoading(true);
    
    // Log the data to the console - helpful for debugging
    console.log("Submitting form data...", formData);

    // try/catch blocks let us attempt something that might fail (try)
    // and handle any errors that occur (catch)
    try {
      /**
       * Sending Data to the Server
       * 
       * Here we use the fetch API to send our form data to the server.
       * The 'await' keyword pauses execution until the fetch completes.
       * This is much cleaner than using the older Promise.then() syntax.
       * 
       * The fetch function takes two parameters:
       * 1. The URL to send the request to
       * 2. An options object with method, headers, and body
       */
      const response = await fetch("/api/chat", {
        // HTTP method - POST is used when sending data to create something new
        method: "POST",
        
        // Headers tell the server what kind of data we're sending
        // Content-Type: application/json means we're sending JSON data
        headers: { "Content-Type": "application/json" },
        
        // The body contains our actual data
        // JSON.stringify converts JavaScript objects to a JSON string
        // We wrap formData in another object with the formData property
        // because that's what our API expects
        body: JSON.stringify({ formData }),
      });

      // Parse the JSON response from the server
      // This is also asynchronous, so we need to await it
      const result = await response.json();
      
      // Check if the request was successful (HTTP status 200-299)
      if (response.ok) {
        // Log the generated CV text (for debugging)
        console.log("Generated CV:", result.response);
        
        // Update the state with the generated CV
        // This will cause React to re-render and display the CV
        setGeneratedCV(result.response);
        
        // If the server returned an ID for the saved CV,
        // save it in state for potential future use
        if (result.savedCV) {
          setSavedCVId(result.savedCV);
          console.log("CV saved with ID:", result.savedCV);
        }
      } else {
        // If the server returned an error status code
        // Display the error in the console
        console.error("Error:", result.error);
        // Show the error to the user
        setError(result.error || "Failed to generate CV");
      }
    } catch (error) {
      // This block catches any exceptions thrown in the try block
      // Examples: Network errors, JSON parsing errors, etc.
      console.error("Error generating CV:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      // Whether successful or not, set loading to false
      setIsLoading(false);
    }
  };

  /**
   * CV Download Handler
   * 
   * This function lets users download their generated CV as a text file.
   * It demonstrates how to create downloadable files directly in the browser
   * without needing a server request.
   * 
   * How it works:
   * 1. Create a Blob (Binary Large Object) containing the CV text
   * 2. Generate a temporary URL that points to this Blob
   * 3. Create an invisible link element and programmatically click it
   * 4. Clean up afterward to avoid memory leaks
   */
  const handleDownload = () => {
    // Step 1: Create a Blob
    // A Blob is a file-like object of raw data
    // The first parameter is an array of content parts (we just have one part)
    // The second parameter is an object with the MIME type
    const blob = new Blob([generatedCV], { type: 'text/plain' });
    
    // Step 2: Create a URL for the Blob
    // This URL points to the blob in memory, not an actual server location
    const url = URL.createObjectURL(blob);
    
    // Step 3: Create and trigger the download
    // Create an invisible <a> element (hyperlink)
    const a = document.createElement('a');
    // Set the link destination to our Blob URL
    a.href = url;
    // Set the filename for the download
    // Replace spaces with underscores for a more URL-friendly filename
    a.download = `${formData.name.replace(/\s+/g, '_')}_CV.txt`;
    
    // Add the link to the page (required for Firefox)
    document.body.appendChild(a);
    // Programmatically click the link to trigger the download
    a.click();
    
    // Step 4: Clean up
    // Remove the link element from the page
    document.body.removeChild(a);
    // Free up memory by revoking the Blob URL
    // This is important to prevent memory leaks
    URL.revokeObjectURL(url);
  };

  /**
   * Component Render Method
   * 
   * Renders the form with multiple sections for CV data entry,
   * and conditionally displays the generated CV when available.
   */
  return (
    <div className={classes.cvFormContainer}>
      {/* Display authentication error if user is not logged in */}
      {authError && (
        <div className={classes.errorMessage}>
          You must be logged in to create a CV. Redirecting to login page...
        </div>
      )}
      
      {/* Display any other errors that occurred */}
      {error && (
        <div className={classes.errorMessage}>{error}</div>
      )}
      
      {/* CV Creation Form - only show if no CV has been generated yet */}
      {!generatedCV ? (
        <form onSubmit={handleSubmit} className={classes.cvForm}>
          <h1 className={classes.formTitle}>Create Your CV</h1>

          {/* Basic Information Section */}
          <div className={classes.formSection}>
            {/* Name Field */}
            <label>
              Full Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required  // HTML5 validation - field is required
                className={classes.inputField}
              />
            </label>

            {/* Email Field */}
            <label>
              Email:
              <input
                type="email"  // HTML5 email input type for validation
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={classes.inputField}
              />
            </label>

            {/* Phone Field */}
            <label>
              Phone:
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={classes.inputField}
              />
            </label>

            {/* LinkedIn Field */}
            <label>
              LinkedIn Profile:
              <input
                type="url"  // HTML5 URL input type for validation
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className={classes.inputField}
              />
            </label>

            {/* Objective Field */}
            <label>
              Objective:
              <textarea
                name="objective"
                value={formData.objective}
                onChange={handleInputChange}
                className={classes.textareaField}
              ></textarea>
            </label>

            {/* Skills Field */}
            <label>
              Skills:
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className={classes.textareaField}
                placeholder="List your skills separated by commas"
              ></textarea>
            </label>

            {/* Certifications Field */}
            <label>
              Certifications:
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className={classes.textareaField}
                placeholder="List your certifications separated by commas"
              ></textarea>
            </label>

            {/* Hobbies Field */}
            <label>
              Hobbies:
              <textarea
                name="hobbies"
                value={formData.hobbies}
                onChange={handleInputChange}
                className={classes.textareaField}
                placeholder="List your hobbies separated by commas"
              ></textarea>
            </label>
          </div>

          {/* Experience Section - Dynamic List */}
          <h2 className={classes.sectionTitle}>Experience</h2>
          {/* Map over each experience item to render input fields */}
          {formData.experience.map((exp, index) => (
            <div key={index} className={classes.experienceItem}>
              {/* Experience Title Field */}
              <label>
                Title:
                <input
                  type="text"  
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Experience Company Field */}
              <label>
                Company:
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Experience Start Date Field */}
              <label>
                Start Date:
                <input
                  type="date"  // HTML5 date input type for date picker
                  value={exp.startDate}
                  onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Experience End Date Field */}
              <label>
                End Date:
                <input
                  type="date"  // HTML5 date input type for date picker
                  value={exp.endDate}
                  onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Experience Responsibilities Field */}
              <label>
                Responsibilities:
                <textarea
                  value={exp.responsibilities}
                  onChange={(e) => handleExperienceChange(index, "responsibilities", e.target.value)}
                  className={classes.textareaField}
                ></textarea>
              </label>
            </div>
          ))}
          {/* Button to add additional experience entries */}
          <button type="button" onClick={addExperience} className={classes.addButton}>
            Add Experience
          </button>

          {/* Education Section - Dynamic List */}
          <h2 className={classes.sectionTitle}>Education</h2>
          {/* Map over each education item to render input fields */}
          {formData.education.map((edu, index) => (
            <div key={index} className={classes.educationItem}>
              {/* Education Degree Field */}
              <label>
                Degree:
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Education Institution Field */}
              <label>
                Institution:
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                  className={classes.inputField}
                />
              </label>
              {/* Education Graduation Date Field */}
              <label>
                Graduation Date:
                <input
                  type="date"  // HTML5 date input type for date picker
                  value={edu.graduationDate}
                  onChange={(e) => handleEducationChange(index, "graduationDate", e.target.value)}
                  className={classes.inputField}
                />
              </label>
            </div>
          ))}
          {/* Button to add additional education entries */}
          <button type="button" onClick={addEducation} className={classes.addButton}>
            Add Education
          </button>

          {/* Form Submission Button */}
          <button 
            type="submit" 
            className={classes.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Generating CV..." : "Generate CV"}
          </button>
        </form>
      ) : (
        /* Generated CV Display Section - Shown when CV is generated */
        <div className={classes.generatedCvContainer}>
          <div className={classes.cvHeader}>
            <h2 className={classes.cvTitle}>Your Generated CV</h2>
            {/* Download Button */}
            <button
              type="button" 
              onClick={handleDownload}
              className={classes.downloadButton}
            >
              Download CV
            </button>
            {/* Create New CV Button */}
            <button
              type="button"
              onClick={() => setGeneratedCV("")}
              className={classes.newCvButton}
            >
              Create Another CV
            </button>
          </div>
          {/* Display the generated CV in a preformatted text block */}
          <pre className={classes.cvOutput}>{generatedCV}</pre>
        </div>
      )}
    </div>
  );
}

// Export the component for use in other parts of the application
export default CVForm;
