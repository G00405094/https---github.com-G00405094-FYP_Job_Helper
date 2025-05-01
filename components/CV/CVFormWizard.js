/**
 * CV Form Wizard Component
 * 
 * This component implements a step-by-step wizard interface for the CV form.
 * It breaks down the CV creation process into logical sections with progress tracking.
 */

import React, { useState } from 'react';
import classes from './styles.module.css';
import SmartSuggestions from './SmartSuggestions';

// Form steps definition
const FORM_STEPS = [
  {
    id: 'intro',
    title: 'Getting Started',
    description: 'Select a template and job title to get started',
    fields: ['template', 'jobTitle']
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Add your contact information and professional summary',
    fields: ['name', 'email', 'phone', 'linkedin', 'objective']
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Add your work history, highlighting key achievements',
    fields: ['experience']
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Add your educational background and qualifications',
    fields: ['education']
  },
  {
    id: 'skills',
    title: 'Skills & Qualifications',
    description: 'Add your skills, certifications, and interests',
    fields: ['skills', 'certifications', 'hobbies']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your CV and make final adjustments',
    fields: ['review']
  }
];

function CVFormWizard({ 
  formData, 
  setFormData, 
  handleSubmit, 
  handleExperienceChange,
  handleEducationChange,
  addExperience,
  addEducation,
  selectedTemplate,
  setSelectedTemplate,
  isLoading,
  error
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedJobCategory, setSelectedJobCategory] = useState('');

  // Handle general form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle job category selection
  const handleJobCategoryChange = (e) => {
    setSelectedJobCategory(e.target.value);
  };

  // Handle adding a suggestion
  const handleAddSuggestion = (field, suggestion) => {
    // Different handling based on the field
    if (field === 'skills') {
      const currentSkills = formData.skills ? formData.skills + ', ' : '';
      setFormData({ ...formData, skills: currentSkills + suggestion });
    } 
    else if (field === 'certifications') {
      const currentCerts = formData.certifications ? formData.certifications + ', ' : '';
      setFormData({ ...formData, certifications: currentCerts + suggestion });
    }
    // For adding action verbs to responsibilities, needs special handling in the UI
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < FORM_STEPS.length) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100;

  // Dynamic form section rendering based on current step
  const renderFormSection = () => {
    const currentStepData = FORM_STEPS[currentStep];
    
    switch (currentStepData.id) {
      case 'intro':
        return (
          <div className={classes.formSection}>
            <div className={classes.fieldGroup}>
              <label htmlFor="jobTitle" className={classes.fieldLabel}>Target Job Title</label>
              <select
                id="jobTitle"
                name="jobTitle"
                className={classes.selectField}
                value={selectedJobCategory}
                onChange={handleJobCategoryChange}
              >
                <option value="">Select a job category</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Web Developer">Web Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Marketing Specialist">Marketing Specialist</option>
                <option value="UX/UI Designer">UX/UI Designer</option>
                <option value="Financial Analyst">Financial Analyst</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Other">Other</option>
              </select>
              <p className={classes.fieldHelp}>
                Selecting a job title helps us provide tailored suggestions
              </p>
            </div>
          </div>
        );
        
      case 'personal':
        return (
          <div className={classes.formSection}>
            <div className={classes.fieldGroup}>
              <label htmlFor="name" className={classes.fieldLabel}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={classes.inputField}
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="email" className={classes.fieldLabel}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={classes.inputField}
                placeholder="e.g. john.doe@example.com"
              />
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="phone" className={classes.fieldLabel}>Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={classes.inputField}
                placeholder="e.g. (555) 123-4567"
              />
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="linkedin" className={classes.fieldLabel}>LinkedIn Profile (Optional)</label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className={classes.inputField}
                placeholder="e.g. linkedin.com/in/johndoe"
              />
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="objective" className={classes.fieldLabel}>Professional Summary</label>
              <textarea
                id="objective"
                name="objective"
                value={formData.objective}
                onChange={handleInputChange}
                className={classes.textareaField}
                rows="5"
                placeholder="Write a brief summary of your professional background, skills, and career goals"
              ></textarea>
              <p className={classes.fieldHelp}>
                A strong summary highlights your professional identity and value proposition
              </p>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className={classes.formSection}>
            {formData.experience.map((exp, index) => (
              <div key={index} className={classes.experienceEntry}>
                <h3 className={classes.entryTitle}>Experience {index + 1}</h3>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className={classes.inputField}
                    placeholder="e.g. Software Developer"
                  />
                </div>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className={classes.inputField}
                    placeholder="e.g. Tech Company Inc."
                  />
                </div>
                
                <div className={classes.dateFields}>
                  <div className={classes.fieldGroup}>
                    <label className={classes.fieldLabel}>Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className={classes.inputField}
                      placeholder="e.g. Jan 2020"
                    />
                  </div>
                  
                  <div className={classes.fieldGroup}>
                    <label className={classes.fieldLabel}>End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className={classes.inputField}
                      placeholder="e.g. Present"
                    />
                  </div>
                </div>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Responsibilities & Achievements</label>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                    className={classes.textareaField}
                    rows="5"
                    placeholder="Describe your responsibilities and achievements. Use bullet points and start with action verbs."
                  ></textarea>
                  
                  {selectedJobCategory && (
                    <SmartSuggestions
                      jobTitle={selectedJobCategory}
                      suggestionType="actionVerbs"
                      onSelectSuggestion={(verb) => {
                        const currentText = exp.responsibilities;
                        const newText = currentText ? `${currentText}\n• ${verb} ` : `• ${verb} `;
                        handleExperienceChange(index, 'responsibilities', newText);
                      }}
                    />
                  )}
                  
                  <p className={classes.fieldHelp}>
                    Focus on achievements with measurable results (e.g., "Increased sales by 20%")
                  </p>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addExperience}
              className={classes.addButton}
            >
              + Add Another Experience
            </button>
          </div>
        );
        
      case 'education':
        return (
          <div className={classes.formSection}>
            {formData.education.map((edu, index) => (
              <div key={index} className={classes.educationEntry}>
                <h3 className={classes.entryTitle}>Education {index + 1}</h3>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Degree / Certificate</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className={classes.inputField}
                    placeholder="e.g. Bachelor of Computer Science"
                  />
                </div>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className={classes.inputField}
                    placeholder="e.g. University of Technology"
                  />
                </div>
                
                <div className={classes.fieldGroup}>
                  <label className={classes.fieldLabel}>Graduation Date</label>
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                    className={classes.inputField}
                    placeholder="e.g. May 2019"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addEducation}
              className={classes.addButton}
            >
              + Add Another Education
            </button>
          </div>
        );
        
      case 'skills':
        return (
          <div className={classes.formSection}>
            <div className={classes.fieldGroup}>
              <label htmlFor="skills" className={classes.fieldLabel}>Skills</label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className={classes.textareaField}
                rows="4"
                placeholder="List your relevant skills, separated by commas (e.g., JavaScript, React, Project Management)"
              ></textarea>
              
              {selectedJobCategory && (
                <SmartSuggestions
                  jobTitle={selectedJobCategory}
                  suggestionType="skills"
                  onSelectSuggestion={(skill) => handleAddSuggestion('skills', skill)}
                />
              )}
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="certifications" className={classes.fieldLabel}>Certifications & Licenses (Optional)</label>
              <textarea
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className={classes.textareaField}
                rows="3"
                placeholder="List any relevant certifications or licenses"
              ></textarea>
              
              {selectedJobCategory && (
                <SmartSuggestions
                  jobTitle={selectedJobCategory}
                  suggestionType="certifications"
                  onSelectSuggestion={(cert) => handleAddSuggestion('certifications', cert)}
                />
              )}
            </div>
            
            <div className={classes.fieldGroup}>
              <label htmlFor="hobbies" className={classes.fieldLabel}>Interests & Activities (Optional)</label>
              <textarea
                id="hobbies"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleInputChange}
                className={classes.textareaField}
                rows="3"
                placeholder="List any relevant hobbies or activities that might strengthen your application"
              ></textarea>
              <p className={classes.fieldHelp}>
                Only include interests that are either relevant to the job or showcase transferable skills
              </p>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className={classes.formSection}>
            <div className={classes.reviewMessage}>
              <h3>Review Your CV</h3>
              <p>
                Check the live preview on the right to ensure all information is correct.
                You can go back to any section to make changes.
              </p>
            </div>
            
            <div className={classes.reviewSummary}>
              <div className={classes.reviewItem}>
                <span>Personal Information</span>
                <button 
                  type="button" 
                  className={classes.editButton}
                  onClick={() => goToStep(1)}
                >
                  Edit
                </button>
              </div>
              
              <div className={classes.reviewItem}>
                <span>Work Experience ({formData.experience.length})</span>
                <button 
                  type="button" 
                  className={classes.editButton}
                  onClick={() => goToStep(2)}
                >
                  Edit
                </button>
              </div>
              
              <div className={classes.reviewItem}>
                <span>Education ({formData.education.length})</span>
                <button 
                  type="button" 
                  className={classes.editButton}
                  onClick={() => goToStep(3)}
                >
                  Edit
                </button>
              </div>
              
              <div className={classes.reviewItem}>
                <span>Skills & Qualifications</span>
                <button 
                  type="button" 
                  className={classes.editButton}
                  onClick={() => goToStep(4)}
                >
                  Edit
                </button>
              </div>
            </div>
            
            <div className={classes.submitContainer}>
              <button
                type="submit"
                className={classes.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Generating CV..." : "Generate CV"}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={classes.wizardContainer}>
      {/* Progress Bar */}
      <div className={classes.progressContainer}>
        <div className={classes.progressBar}>
          <div
            className={classes.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className={classes.stepIndicators}>
          {FORM_STEPS.map((step, index) => (
            <div 
              key={index}
              className={`${classes.stepIndicator} ${index === currentStep ? classes.activeStep : ''} ${index < currentStep ? classes.completedStep : ''}`}
              onClick={() => goToStep(index)}
            >
              <div className={classes.stepDot}></div>
              <span className={classes.stepLabel}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Form Step Header */}
      <div className={classes.stepHeader}>
        <h2 className={classes.stepTitle}>{FORM_STEPS[currentStep].title}</h2>
        <p className={classes.stepDescription}>{FORM_STEPS[currentStep].description}</p>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className={classes.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Form Content */}
      <form onSubmit={handleSubmit} className={classes.wizardForm}>
        {renderFormSection()}
        
        {/* Navigation Buttons */}
        <div className={classes.navigationButtons}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className={classes.backButton}
            >
              Back
            </button>
          )}
          
          {currentStep < FORM_STEPS.length - 1 && (
            <button
              type="button"
              onClick={goToNextStep}
              className={classes.nextButton}
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CVFormWizard; 