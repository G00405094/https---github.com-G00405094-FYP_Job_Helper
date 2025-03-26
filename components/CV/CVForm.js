import React, { useState } from "react";
import classes from "./styles.module.css";

// Main CVForm Component
function CVForm() {
  // State to manage form data, initializing with all necessary fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    objective: "",
    skills: "", // For listing skills
    certifications: "", // For listing certifications
    hobbies: "", // For listing hobbies
    experience: [
      {
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    education: [
      {
        degree: "",
        institution: "",
        graduationDate: "",
      },
    ],
  });

  // Event handler function to handle form
  const handleInputChange = (e) => { //event when onchange triggered
    const { name, value } = e.target; // Get the field name and value
    setFormData({ ...formData, [name]: value }); // Update the corresponding field in formData
  };

  // Handles input changes for experience array
  const handleExperienceChange = (index, field, value) => { // index because there can be more than 1
    const updatedExperience = [...formData.experience]; // Copy the existing experience array
    updatedExperience[index][field] = value; // Update the specific field in the experience object
    setFormData({ ...formData, experience: updatedExperience }); // Update formData with modified experience array
  };

  // Handles input changes for education array
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education]; 
    updatedEducation[index][field] = value; 
    setFormData({ ...formData, education: updatedEducation }); 
  };

  // Adds a blank experience object to the experience array
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: "", company: "", startDate: "", endDate: "", responsibilities: "" },
      ],
    });
  };

  // Adds a blank education object to the education array
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: "", institution: "", graduationDate: "" },
      ],
    });
  };

  // Handles form submission and sends data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent browser refresh
    console.log("Submitting form data...", formData);

    try {
      const response = await fetch("/api/chat", {
        method: "POST", // Use POST to send form data
        headers: { "Content-Type": "application/json" }, // Set content type
        body: JSON.stringify({ formData }), // Convert formData to JSON string
      });

      const result = await response.json(); // Parse the JSON response
      if (response.ok) {
        console.log("Generated CV:", result.response); // Log the response
        setGeneratedCV(result.response); // Set generated CV to state
        
        // Save the CV ID if it was returned
        if (result.savedCV) {
          setSavedCVId(result.savedCV);
          console.log("CV saved with ID:", result.savedCV);
        }
      } else {
        console.error("Error:", result.error); // Log error
        alert(result.error); // Alert the user with error message
      }
    } catch (error) {
      console.error("Error generating CV:", error); // Log fetch error
    }
  };

  const [generatedCV, setGeneratedCV] = useState(""); // State to hold the generated CV
  const [savedCVId, setSavedCVId] = useState(null);

  // Add a function to handle CV download
  const handleDownload = () => {
    // Create a blob from the CV text
    const blob = new Blob([generatedCV], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, '_')}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={classes.cvFormContainer}>
      <form onSubmit={handleSubmit} className={classes.cvForm}>
        <h1 className={classes.formTitle}>Create Your CV</h1>

        {/* Basic Information */}
        <div className={classes.formSection}>
          <label>
            Full Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={classes.inputField}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={classes.inputField}
            />
          </label>

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

          <label>
            LinkedIn Profile:
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              className={classes.inputField}
            />
          </label>

          <label>
            Objective:
            <textarea
              name="objective"
              value={formData.objective}
              onChange={handleInputChange}
              className={classes.textareaField}
            ></textarea>
          </label>

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

        {/* Experience Section */}
        <h2 className={classes.sectionTitle}>Experience</h2>
        {formData.experience.map((exp, index) => (
          <div key={index} className={classes.experienceItem}>
            <label>
              Title:
              <input
                type="text"  
                value={exp.title}
                onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                className={classes.inputField}
              />
            </label>
            <label>
              Company:
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                className={classes.inputField}
              />
            </label>
            <label>
              Start Date:
              <input
                type="date"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                className={classes.inputField}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                className={classes.inputField}
              />
            </label>
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
        <button type="button" onClick={addExperience} className={classes.addButton}>
          Add Experience
        </button>

        {/* Education Section */}
        <h2 className={classes.sectionTitle}>Education</h2>
        {formData.education.map((edu, index) => (
          <div key={index} className={classes.educationItem}>
            <label>
              Degree:
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                className={classes.inputField}
              />
            </label>
            <label>
              Institution:
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                className={classes.inputField}
              />
            </label>
            <label>
              Graduation Date:
              <input
                type="date"
                value={edu.graduationDate}
                onChange={(e) => handleEducationChange(index, "graduationDate", e.target.value)}
                className={classes.inputField}
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={addEducation} className={classes.addButton}>
          Add Education
        </button>

        <button type="submit" className={classes.submitButton}>
          Generate CV
        </button>
      </form>
      
      {generatedCV && (
        <div className={classes.generatedCvContainer}>
          <div className={classes.cvHeader}>
            <h2 className={classes.cvTitle}>Your Generated CV</h2>
            <button 
              type="button" 
              onClick={handleDownload} 
              className={classes.downloadButton}
            >
              Download CV
            </button>
          </div>
          <pre className={classes.cvOutput}>{generatedCV}</pre>
        </div>
      )}
    </div>
  );
}

export default CVForm;
