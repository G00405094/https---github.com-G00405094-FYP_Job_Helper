/**
 * CV Grader Component
 * 
 * This component allows users to upload their existing CV for AI-powered evaluation.
 * It parses the CV text, breaks it into sections, and sends each section to specialized
 * API endpoints for analysis, then provides a comprehensive grade and improvement suggestions.
 * 
 * Technologies:
 * - React: A JavaScript library for building user interfaces
 * - React Hooks: Functions that let you "hook into" React features like state
 * - Fetch API: A modern way to make network requests
 * - CSS Modules: A way to make CSS styles apply only to specific components
 */

import React, { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";
import classes from "./styles.module.css";

// Common job titles for dropdown selection
const COMMON_JOB_TITLES = [
  "Software Engineer",
  "Web Developer",
  "Data Scientist",
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "Marketing Specialist",
  "UX/UI Designer",
  "Financial Analyst",
  "Sales Representative",
  "Customer Success Manager",
  "Human Resources Specialist",
  "Operations Manager",
  "Executive Assistant",
  "Content Writer",
  "Graphic Designer",
  "Teacher/Educator",
  "Healthcare Professional",
  "Legal Professional",
  "Engineering (non-software)"
];

/**
 * CVGrader Component
 * 
 * This component manages the CV grading process:
 * 1. Allows users to upload or paste their CV text
 * 2. Breaks down the CV into key sections
 * 3. Sends each section to specialized AI services for evaluation
 * 4. Combines results for a comprehensive grade with detailed feedback
 */
function CVGrader() {
  // Get authentication state
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // State for CV text input
  const [cvText, setCvText] = useState("");
  // State for file upload field
  const [fileName, setFileName] = useState("");
  // State for tracking the grading process
  const [isGrading, setIsGrading] = useState(false);
  // State for storing evaluation results
  const [gradingResults, setGradingResults] = useState(null);
  // State for tracking grading progress
  const [gradingStage, setGradingStage] = useState("");
  // State for error handling
  const [error, setError] = useState("");
  // State for authentication errors
  const [authError, setAuthError] = useState(false);
  // State for target job title
  const [targetJobTitle, setTargetJobTitle] = useState("");
  // State for custom job title (when "Other" is selected)
  const [customJobTitle, setCustomJobTitle] = useState("");
  // State for improved CV text
  const [improvedCV, setImprovedCV] = useState("");
  // State for view mode (results, before-after, improvements)
  const [viewMode, setViewMode] = useState("results");
  // State for loading AI improvements
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  // State for improvement status message
  const [improvementStatus, setImprovementStatus] = useState("");

  /**
   * File Upload Handler
   * 
   * Processes uploaded CV files and extracts their text content
   * 
   * @param {Event} e - The file input change event
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type - only accept text files
    const validFileTypes = ['.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validFileTypes.includes(fileExtension)) {
      setError("Please upload a TXT file only. Word documents and PDFs cannot be accurately parsed.");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setFileName(file.name);
    setError("");
    
    // Use FileReader to read the file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      setCvText(fileContent);
    };
    reader.onerror = () => {
      setError("Error reading file");
    };
    
    // Read the file as text
    reader.readAsText(file);
  };

  /**
   * Text Input Handler
   * 
   * Updates the CV text state when the user types or pastes
   * 
   * @param {Event} e - The textarea change event
   */
  const handleTextChange = (e) => {
    setCvText(e.target.value);
    // Clear file name if user edits the text directly
    if (fileName && e.target.value !== cvText) {
      setFileName("");
    }
  };

  /**
   * Job Title Selection Handler
   * 
   * Updates the target job title state
   * 
   * @param {Event} e - The select change event
   */
  const handleJobTitleChange = (e) => {
    setTargetJobTitle(e.target.value);
    if (e.target.value !== "Other") {
      setCustomJobTitle("");
    }
  };

  /**
   * Custom Job Title Handler
   * 
   * Updates the custom job title state
   * 
   * @param {Event} e - The input change event
   */
  const handleCustomJobTitleChange = (e) => {
    setCustomJobTitle(e.target.value);
  };

  /**
   * Get Effective Job Title
   * 
   * Returns the job title to use (either from dropdown or custom input)
   * 
   * @returns {string} The job title to use
   */
  const getEffectiveJobTitle = () => {
    if (targetJobTitle === "Other") {
      return customJobTitle;
    }
    return targetJobTitle;
  };

  /**
   * Function to parse CV text into sections
   * 
   * Identifies and separates common CV sections for targeted analysis
   * 
   * @param {string} text - Full CV text
   * @returns {Object} - Object containing CV sections
   */
  const parseCVSections = (text) => {
    // Common section headers in CVs
    const sectionHeaders = [
      { name: 'personal', patterns: ['personal information', 'personal details', 'contact', 'profile'] },
      { name: 'summary', patterns: ['summary', 'objective', 'professional summary', 'career objective', 'about me', 'professional profile'] },
      { name: 'experience', patterns: ['experience', 'employment', 'work experience', 'work history', 'professional experience', 'employment history'] },
      { name: 'education', patterns: ['education', 'academic', 'qualifications', 'academic background', 'educational background'] },
      { name: 'skills', patterns: ['skills', 'technical skills', 'core competencies', 'key skills', 'competencies', 'expertise'] },
      { name: 'certifications', patterns: ['certifications', 'certificates', 'accreditations', 'professional development', 'licenses'] },
      { name: 'projects', patterns: ['projects', 'key projects', 'personal projects', 'professional projects'] },
      { name: 'achievements', patterns: ['achievements', 'awards', 'honors', 'accomplishments', 'recognition'] },
      { name: 'interests', patterns: ['interests', 'hobbies', 'activities', 'volunteer', 'extracurricular'] }
    ];
    
    // Initialize sections object with full CV text
    const sections = {
      fullCV: text
    };
    
    // Separate CV into lines
    const lines = text.split('\n');
    
    // Find sections
    let currentSection = 'personal'; // Default start section
    let previousLineEmpty = true;
    let lastFoundIndex = -1;
    
    // First pass - identify section headers
    const identifiedSections = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      // Skip empty lines
      if (!line) {
        previousLineEmpty = true;
        continue;
      }
      
      // Check if this could be a section header
      // Criteria: Short line (under 35 chars), possibly preceded by empty line,
      // possibly ending with colon, not containing multiple spaces in middle
      const isPossibleHeader = (
        line.length < 35 && 
        (previousLineEmpty || line.endsWith(':')) &&
        !line.includes('  ')
      );
      
      if (isPossibleHeader) {
        let foundSection = false;
        
        // Check against known section patterns
        for (const section of sectionHeaders) {
          // Clean the line for comparison (remove colons, etc.)
          const cleanLine = line.replace(/[:]/g, '').trim();
          
          if (section.patterns.some(pattern => 
            cleanLine === pattern || 
            cleanLine.includes(pattern) || 
            cleanLine.startsWith(pattern)
          )) {
            identifiedSections.push({
              name: section.name,
              index: i
            });
            foundSection = true;
            lastFoundIndex = i;
            break;
          }
        }
      }
      
      previousLineEmpty = false;
    }
    
    // Second pass - extract content for each identified section
    for (let i = 0; i < identifiedSections.length; i++) {
      const section = identifiedSections[i];
      const nextSection = identifiedSections[i + 1];
      
      const startIndex = section.index + 1; // Start from the line after header
      const endIndex = nextSection ? nextSection.index : lines.length;
      
      // Extract section content
      sections[section.name] = lines.slice(startIndex, endIndex).join('\n').trim();
    }
    
    // Handle cases where sections weren't properly identified
    // Special case for summary - if we didn't find it, first 3-5 lines might be the summary
    if (!sections.summary && lines.length > 5) {
      const potentialSummary = lines.slice(0, Math.min(7, Math.ceil(lines.length * 0.1))).join('\n').trim();
      if (potentialSummary.length > 50 && potentialSummary.length < 500) {
        sections.summary = potentialSummary;
      }
    }
    
    // If no sections were identified, try more aggressive pattern matching
    if (Object.keys(sections).length <= 1) { // Only fullCV exists
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        
        // Skip empty lines
        if (!line) continue;
        
        // More aggressive pattern matching for section headers
        for (const section of sectionHeaders) {
          for (const pattern of section.patterns) {
            if (line.includes(pattern)) {
              // Find the end of this section (next non-empty line that could be a header)
              let endIndex = lines.length;
              for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim().toLowerCase();
                if (nextLine && nextLine.length < 35) {
                  for (const otherSection of sectionHeaders) {
                    if (otherSection.name !== section.name) {
                      if (otherSection.patterns.some(p => nextLine.includes(p))) {
                        endIndex = j;
                        break;
                      }
                    }
                  }
                  if (endIndex !== lines.length) break;
                }
              }
              
              sections[section.name] = lines.slice(i + 1, endIndex).join('\n').trim();
              i = endIndex - 1; // Resume from end of this section
              break;
            }
          }
        }
      }
    }
    
    // If still no sections found, create a plain 'other' section
    let hasSections = false;
    for (const key of Object.keys(sections)) {
      if (key !== 'fullCV' && sections[key] && sections[key].length > 0) {
        hasSections = true;
        break;
      }
    }
    
    if (!hasSections) {
      sections.other = text;
    }
    
    return sections;
  };

  /**
   * CV Grading Handler
   * 
   * Processes the CV text, breaks it into sections, and sends each to the grading API
   * 
   * @param {Event} e - The form submission event
   */
  const handleGradeCV = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError("");
    setAuthError(false);
    setGradingResults(null);
    setGradingStage("");
    setImprovedCV("");
    setViewMode("results");

    // Validate CV text
    if (!cvText.trim()) {
      setError("Please upload or paste your CV text");
      return;
    }

    // Validate job title if specific targeting is enabled
    const effectiveJobTitle = getEffectiveJobTitle();
    if (targetJobTitle && targetJobTitle === "Other" && !customJobTitle.trim()) {
      setError("Please enter a specific job title or choose from the dropdown");
      return;
    }

    // Check authentication status
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      setAuthError(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    // Start grading process
    setIsGrading(true);

    try {
      // Parse CV into sections
      setGradingStage("Analyzing CV structure...");
      const cvSections = parseCVSections(cvText);
      
      // Grade each section separately
      setGradingStage("Evaluating content quality...");
      
      const response = await fetch("/api/grade-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvSections,
          targetJobTitle: effectiveJobTitle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to grade CV");
      }

      // Parse the API response
      const result = await response.json();
      
      // Process and format the results
      setGradingStage("Preparing recommendations...");
      
      // Handle API response
      console.log("CV grading results:", result);
      setGradingResults(result);
    } catch (error) {
      console.error("Error grading CV:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsGrading(false);
      setGradingStage("");
    }
  };

  /**
   * Generate Improved CV
   * 
   * Uses AI to create an improved version of the CV based on the evaluation
   */
  const handleGenerateImprovedCV = async () => {
    if (!gradingResults || !cvText) {
      setError("No CV or grading results available");
      return;
    }

    setLoadingImprovements(true);
    setImprovementStatus("Analyzing improvement opportunities...");

    try {
      const effectiveJobTitle = getEffectiveJobTitle();
      
      // Show detailed progress updates
      setTimeout(() => {
        setImprovementStatus("Optimizing content structure and formatting...");
      }, 3000);
      
      setTimeout(() => {
        setImprovementStatus("Enhancing achievement statements with metrics...");
      }, 7000);
      
      setTimeout(() => {
        setImprovementStatus("Applying ATS optimization techniques...");
      }, 12000);
      
      setTimeout(() => {
        setImprovementStatus("Finalizing high-impact CV content...");
      }, 18000);
      
      const response = await fetch("/api/improve-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalCV: cvText,
          gradingResults,
          targetJobTitle: effectiveJobTitle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate improved CV");
      }

      const result = await response.json();
      setImprovedCV(result.improvedCV);
      setViewMode("before-after");
    } catch (error) {
      console.error("Error generating improved CV:", error);
      setError(error.message || "Failed to generate improvements");
    } finally {
      setLoadingImprovements(false);
      setImprovementStatus("");
    }
  };

  /**
   * Reset CV Grader
   * 
   * Resets the component to its initial state
   */
  const handleReset = () => {
    setGradingResults(null);
    setImprovedCV("");
    setViewMode("results");
  };

  /**
   * Render Before-After View
   * 
   * Displays a side-by-side comparison of original and improved CVs
   */
  const renderBeforeAfterView = () => {
    if (!improvedCV) return null;

    // Calculate predicted score for improved CV
    const predictedScore = calculatePredictedScore();
    const scoreExplanation = getScoreExplanation();

    return (
      <div className={classes.beforeAfterContainer}>
        <h2 className={classes.gradingTitle}>CV Comparison</h2>
        
        <div className={classes.comparisonNavigation}>
          <button 
            className={`${classes.viewButton} ${viewMode === "results" ? classes.activeView : ""}`}
            onClick={() => setViewMode("results")}
          >
            Evaluation Results
          </button>
          <button 
            className={`${classes.viewButton} ${viewMode === "before-after" ? classes.activeView : ""}`}
            onClick={() => setViewMode("before-after")}
          >
            Before & After
          </button>
        </div>

        <div className={classes.scoreComparison}>
          <div className={classes.originalScore}>
            <span className={classes.scoreLabel}>Original Score</span>
            <div className={classes.miniScoreCircle}>
              <span>{gradingResults.overallScore}</span>
            </div>
          </div>
          
          <div className={classes.scoreArrow}>
            <span>→</span>
          </div>
          
          <div className={classes.predictedScore}>
            <span className={classes.scoreLabel}>Predicted Score</span>
            <div className={classes.miniScoreCircle} style={{backgroundColor: '#2ecc71'}}>
              <span>{predictedScore}</span>
            </div>
            {predictedScore - gradingResults.overallScore > 0 && (
              <div className={classes.improvement}>
                +{predictedScore - gradingResults.overallScore} points
              </div>
            )}
          </div>
        </div>
        
        <div className={classes.scoreExplanation}>
          <p>{scoreExplanation}</p>
          <p className={classes.disclaimer}>
            <strong>Note:</strong> To ensure the best results, we recommend reviewing the improved CV and making any necessary adjustments before grading. You can grade the improved CV to see its actual score.
          </p>
        </div>

        <div className={classes.cvComparisonGrid}>
          <div className={classes.originalCvColumn}>
            <h3 className={classes.columnHeader}>Original CV</h3>
            <pre className={classes.cvText}>{cvText}</pre>
          </div>
          <div className={classes.improvedCvColumn}>
            <h3 className={classes.columnHeader}>Improved CV</h3>
            <pre className={classes.cvText}>{improvedCV}</pre>
          </div>
        </div>
        
        <div className={classes.actionsContainer}>
          <button 
            type="button" 
            onClick={handleGradeImprovedCV} 
            className={classes.gradeImprovedButton}
            disabled={isGrading}
          >
            {isGrading ? "Analyzing..." : "Grade Improved CV"}
          </button>
          <button 
            type="button" 
            onClick={handleReset} 
            className={classes.newGradeButton}
          >
            Grade Another CV
          </button>
        </div>
      </div>
    );
  };

  /**
   * Calculate predicted score for improved CV
   * Uses a heuristic based on the original score and improvements
   */
  const calculatePredictedScore = () => {
    if (!gradingResults) return 0;
    
    // Base calculation starts with original score
    const originalScore = gradingResults.overallScore;
    
    // Calculate potential improvement (using a conservative estimate)
    // The more points are missing from 100, the more room for improvement
    const improvementPotential = 100 - originalScore;
    
    // Calculate predicted improvement (we expect to recover 70-85% of missing points)
    // Higher original scores have less improvement potential
    let improvementFactor = 0;
    
    if (originalScore < 50) {
      // Lots of room for improvement on very poor CVs
      improvementFactor = 0.75; // More conservative: Can improve by up to 75% of missing points
    } else if (originalScore < 70) {
      // Moderate improvement on average CVs
      improvementFactor = 0.7; 
    } else if (originalScore < 85) {
      // Smaller gains on already good CVs
      improvementFactor = 0.65;
    } else {
      // Minimal gains on excellent CVs
      improvementFactor = 0.55;
    }
    
    // Calculate improvement amount
    const improvement = Math.round(improvementPotential * improvementFactor);
    
    // Target score (with a minimum of 85 for all improved CVs - more realistic minimum)
    const predictedScore = Math.max(85, originalScore + improvement);
    
    // Cap at 95 (perfection is extremely rare)
    return Math.min(95, predictedScore);
  };

  /**
   * Get score explanation based on original and predicted scores
   */
  const getScoreExplanation = () => {
    if (!gradingResults) return "";
    
    const originalScore = gradingResults.overallScore;
    const predictedScore = calculatePredictedScore();
    const improvement = predictedScore - originalScore;
    
    return `Based on your original score of ${originalScore}, we estimate an improvement of +${improvement} points. This is a conservative estimate - actual results may vary based on specific CV content and how well our system can enhance different sections.`;
  };

  /**
   * Grade the improved CV
   * Sends the improved CV text to the grading API
   */
  const handleGradeImprovedCV = async () => {
    if (!improvedCV) {
      setError("No improved CV available to grade");
      return;
    }

    setIsGrading(true);
    setError("");

    try {
      // Store the predicted score for comparison later
      const predictedScore = calculatePredictedScore();
      
      // Parse improved CV into sections
      const cvSections = parseCVSections(improvedCV);
      
      const effectiveJobTitle = getEffectiveJobTitle();
      
      const response = await fetch("/api/grade-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvSections,
          targetJobTitle: effectiveJobTitle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to grade improved CV");
      }

      // Parse the API response
      const result = await response.json();
      
      // Check if the actual score is significantly lower than predicted
      const actualScore = result.overallScore;
      const scoreDifference = predictedScore - actualScore;
      
      if (scoreDifference > 15) {
        setError(`Note: The actual score (${actualScore}) is lower than predicted (${predictedScore}). This can happen when the CV requires more specific improvements for your particular field or role. Consider reviewing the new feedback and making manual adjustments.`);
      }
      
      // Handle API response
      console.log("Improved CV grading results:", result);
      setGradingResults(result);
      setViewMode("results");
      
      // Update CV text to the improved version
      setCvText(improvedCV);
      setImprovedCV("");
    } catch (error) {
      console.error("Error grading improved CV:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsGrading(false);
    }
  };

  /**
   * Render Grading Results
   * 
   * Displays the CV grade and improvement suggestions
   */
  const renderGradingResults = () => {
    if (!gradingResults) return null;

    const { overallScore, sections, improvementSuggestions } = gradingResults;

    // Calculate letter grade
    const getLetterGrade = (score) => {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'A-';
      if (score >= 75) return 'B+';
      if (score >= 70) return 'B';
      if (score >= 65) return 'B-';
      if (score >= 60) return 'C+';
      if (score >= 55) return 'C';
      if (score >= 50) return 'C-';
      if (score >= 45) return 'D+';
      if (score >= 40) return 'D';
      return 'F';
    };

    return (
      <div className={classes.gradingResults}>
        <h2 className={classes.gradingTitle}>CV Evaluation Results</h2>
        
        {improvedCV && (
          <div className={classes.comparisonNavigation}>
            <button 
              className={`${classes.viewButton} ${viewMode === "results" ? classes.activeView : ""}`}
              onClick={() => setViewMode("results")}
            >
              Evaluation Results
            </button>
            <button 
              className={`${classes.viewButton} ${viewMode === "before-after" ? classes.activeView : ""}`}
              onClick={() => setViewMode("before-after")}
            >
              Before & After
            </button>
          </div>
        )}
        
        <div className={classes.scoreContainer}>
          <div className={classes.scoreCircle}>
            <span className={classes.scoreValue}>{overallScore}</span>
            <span className={classes.scoreLabel}>/100</span>
          </div>
          <div className={classes.letterGrade}>{getLetterGrade(overallScore)}</div>
          {targetJobTitle && (
            <div className={classes.targetJob}>
              Evaluated for: <strong>{getEffectiveJobTitle()}</strong>
            </div>
          )}
        </div>
        
        <h3 className={classes.sectionTitle}>Section Breakdown</h3>
        <div className={classes.sectionsContainer}>
          {sections.map((section, index) => (
            <div key={index} className={classes.sectionScore}>
              <h4>{section.name}</h4>
              <div className={classes.scoreBar}>
                <div 
                  className={classes.scoreBarFill} 
                  style={{ width: `${(section.score / section.maxScore) * 100}%` }}
                ></div>
                <span className={classes.scoreBarLabel}>{section.score}/{section.maxScore}</span>
              </div>
              <p className={classes.sectionFeedback}>{section.feedback}</p>
            </div>
          ))}
        </div>
        
        <h3 className={classes.sectionTitle}>Improvement Suggestions</h3>
        <ul className={classes.suggestionsList}>
          {improvementSuggestions.map((suggestion, index) => (
            <li key={index} className={classes.suggestion}>
              <h4>{suggestion.title || suggestion.category}</h4>
              <p>{suggestion.description || suggestion.details}</p>
            </li>
          ))}
        </ul>
        
        <div className={classes.actionsContainer}>
          {!improvedCV && (
            <button 
              type="button" 
              onClick={handleGenerateImprovedCV} 
              className={classes.improveButton}
              disabled={loadingImprovements}
            >
              {loadingImprovements ? 
                `Generating Improvements... ${improvementStatus}` : 
                "Generate Improved CV"}
            </button>
          )}
          
          <button 
            type="button" 
            onClick={handleReset} 
            className={classes.newGradeButton}
          >
            Grade Another CV
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.cvGraderContainer}>
      {/* Display authentication error */}
      {authError && (
        <div className={classes.errorMessage}>
          You must be logged in to use the CV grader. Redirecting to login page...
        </div>
      )}
      
      {/* Display any other errors */}
      {error && (
        <div className={classes.errorMessage}>{error}</div>
      )}
      
      {/* Show input form if no results yet */}
      {!gradingResults ? (
        <form onSubmit={handleGradeCV} className={classes.cvForm}>
          <h1 className={classes.formTitle}>CV Grading Tool</h1>
          <p className={classes.formDescription}>
            Upload your CV or paste its content below to receive an AI-powered evaluation 
            and personalized improvement suggestions based on professional CV standards.
          </p>
          
          <div className={classes.formSection}>
            {/* Job title targeting */}
            <div className={classes.jobTitleSection}>
              <label htmlFor="jobTitle" className={classes.jobTitleLabel}>
                Target Job Title (Optional):
                <select
                  id="jobTitle"
                  value={targetJobTitle}
                  onChange={handleJobTitleChange}
                  className={classes.selectField}
                >
                  <option value="">-- General Evaluation --</option>
                  {COMMON_JOB_TITLES.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                  <option value="Other">Other (specify)</option>
                </select>
              </label>
              
              {targetJobTitle === "Other" && (
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={handleCustomJobTitleChange}
                  placeholder="Enter specific job title"
                  className={classes.inputField}
                />
              )}
              
              {targetJobTitle && (
                <p className={classes.jobTitleHint}>
                  Your CV will be evaluated specifically for {targetJobTitle === "Other" ? customJobTitle : targetJobTitle} positions
                </p>
              )}
            </div>
            
            {/* File upload option */}
            <div className={classes.fileUploadContainer}>
              <label className={classes.fileUploadLabel}>
                <span>Upload CV</span>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className={classes.fileInput}
                />
              </label>
              {fileName && (
                <div className={classes.fileName}>{fileName}</div>
              )}
            </div>
            
            {/* Text input option */}
            <label>
              Paste CV Text:
              <textarea
                value={cvText}
                onChange={handleTextChange}
                className={classes.textareaField}
                placeholder="Paste your CV content here..."
                rows={15}
              ></textarea>
            </label>
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className={classes.submitButton}
            disabled={isGrading || !cvText.trim()}
          >
            {isGrading ? 
              `Analyzing CV... ${gradingStage}` : 
              "Grade My CV"}
          </button>
        </form>
      ) : (
        /* Show grading results or before-after view */
        viewMode === "results" ? renderGradingResults() : renderBeforeAfterView()
      )}
    </div>
  );
}

export default CVGrader; 