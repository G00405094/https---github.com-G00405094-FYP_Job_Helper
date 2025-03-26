import React, { useState, useEffect } from "react";
import styles from "./JobSearch.module.css";

// JobSearch Component: Handles job searching and interview preparation
function JobSearch() {
  // States
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobs, setJobs] = useState([]);  // State to store fetched job listings
  const [interviewResponse, setInterviewResponse] = useState(""); // State to store the interview preparation response
  const [loading, setLoading] = useState(false);  // State to track loading status while fetching job data
  const [loadingInterview, setLoadingInterview] = useState(false); // State to track loading status while fetching interview information

  // Add new states for cover letter generation
  const [savedCVs, setSavedCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterJobId, setCoverLetterJobId] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Fetch saved CVs when component mounts
  useEffect(() => {
    async function fetchSavedCVs() {
      try {
        const response = await fetch('/api/cvs');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setSavedCVs(result.data);
          // Set the first CV as selected by default if available
          if (result.data.length > 0) {
            setSelectedCVId(result.data[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching saved CVs:", error);
      }
    }
    
    fetchSavedCVs();
  }, []);

  // Function to handle job search based on jobTitle and location inputs
  const handleSearch = async () => {
    // Ensure both job title and location are provided
    if (!jobTitle || !location) {
      alert("Please enter both job title and location.");
      return;
    }

    setLoading(true); // Set loading state to true during API call

    try {
      // Fetch job listings from API
      const response = await fetch(
        `/api/search-jobs?query=${encodeURIComponent(
          jobTitle
        )}&location=${encodeURIComponent(location)}`
      );

      // Handle unsuccessful API responses
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      // Parse response data as JSON
      const data = await response.json();
      // Update state with job listings if data is available
      if (data.length > 0) {
        setJobs(data);
      } else {
        // Alert if no jobs are found
        alert("No jobs found for the given criteria.");
        setJobs([]); // Clear previous job results
      }
    } catch (error) {
      console.error("Error fetching jobs:", error); // Log errors
      alert("An error occurred while fetching job data. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false after API call
    }
  };

  // Function to handle fetching interview preparation data
  const handleInterviewPrep = async () => {
    // Ensure company name is provided
    if (!companyName) {
      alert("Please enter a company name.");
      return;
    }

    setLoadingInterview(true); // Set loading state to true during API call

    try {
      // Send company to API
      const response = await fetch("/api/interview-prep", {
        method: "POST", // POST method to send data to the server
        headers: { "Content-Type": "application/json" }, // Set JSON header
        body: JSON.stringify({ company: companyName }), // Send company name as JSON
      });

      // Handle unsuccessful API responses
      if (!response.ok) {
        throw new Error(`Error fetching interview prep: ${response.statusText}`);
      }

      // Parse response and update interview response state
      const data = await response.json();
      setInterviewResponse(data.response); // Store the API response
    } catch (error) {
      console.error("Error fetching interview information:", error); // Log errors
      alert("An error occurred while fetching interview information. Please try again.");
    } finally {
      setLoadingInterview(false); // Set loading state to false after API call
    }
  };

  // Function to handle cover letter generation
  const handleGenerateCoverLetter = async (job) => {
    if (!selectedCVId) {
      alert("Please select a CV to generate a cover letter.");
      return;
    }

    setGeneratingCoverLetter(true);
    setCoverLetterJobId(job.id);
    setCoverLetter("");

    try {
      // First, fetch the full job details if needed
      let fullJobDescription = job.description || job.text;
      
      // If there's no description available in the initial job data
      if (!fullJobDescription && job.url) {
        try {
          // Optional: You could implement an API route to fetch the full job details
          // from the job URL, but this requires server-side scraping which may be complex
          console.log("No job description available, will generate based on title and company only");
        } catch (fetchError) {
          console.error("Error fetching full job details:", fetchError);
        }
      }

      // Prepare job data for the API
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId: selectedCVId,
          jobTitle: job.role || job.title, // Handle both property names
          company: job.company_name || job.company, // Handle both property names
          jobDescription: fullJobDescription || 
            `This is a ${job.role || job.title} position at ${job.company_name || job.company}`, // Fallback description
          location: job.location,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setCoverLetter(result.coverLetter);
      } else {
        alert(result.error || "Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("An error occurred while generating the cover letter. Please try again.");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  // Function to handle cover letter download
  const handleDownloadCoverLetter = () => {
    // Find the job that matches the cover letter
    const job = jobs.find(j => j.id === coverLetterJobId);
    if (!job || !coverLetter) return;
    
    // Create a blob from the cover letter text
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${job.company_name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.jobSearchContainer}>
      <h2 className={styles.heading}>Find Your Next Job</h2>
      
      {/* CV Selection for Cover Letter - MOVED TO TOP */}
      <div className={styles.cvSelection}>
        <h3>Select CV for Cover Letter Generation:</h3>
        <select 
          value={selectedCVId} 
          onChange={(e) => setSelectedCVId(e.target.value)}
          className={styles.cvSelect}
        >
          <option value="">Select a CV</option>
          {savedCVs.map(cv => (
            <option key={cv._id} value={cv._id}>
              {cv.name} - {new Date(cv.createdAt).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.searchFields}>
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={styles.inputField}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={styles.searchButton}
        >
          {loading ? "Searching..." : "Search Jobs"}
        </button>
      </div>
      
      {/* Job results with cover letter generation button */}
      <div className={styles.jobResults}>
        {jobs.map((job, index) => (
          <div key={index} className={styles.jobItem}>
            <h3>{job.title}</h3>
            <p><strong>Company:</strong> {job.company_name || "Not specified"}</p>
            <p><strong>Location:</strong> {job.location || "Not specified"}</p>
            
            <div className={styles.jobActions}>
              <a 
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewJobButton}
              >
                View Job
              </a>
              <button 
                onClick={() => handleGenerateCoverLetter(job)}
                disabled={generatingCoverLetter && coverLetterJobId === job.id || !selectedCVId}
                className={styles.coverLetterButton}
                title={!selectedCVId ? "Please select a CV first" : ""}
              >
                {generatingCoverLetter && coverLetterJobId === job.id ? 
                  "Generating..." : "Generate Cover Letter"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Display generated cover letter */}
      {coverLetter && (
        <div className={styles.coverLetterContainer}>
          <div className={styles.coverLetterHeader}>
            <h3>Generated Cover Letter</h3>
            <button 
              onClick={handleDownloadCoverLetter}
              className={styles.downloadButton}
            >
              Download Cover Letter
            </button>
          </div>
          <pre className={styles.coverLetterContent}>{coverLetter}</pre>
        </div>
      )}
      
      {/* Interview Preparation Section */}
      <div className={styles.interviewPrepContainer}>
        <h2 className={styles.subheading}>Interview Preparation</h2>

        {/* Input Field for Company Name */}
        <input
          type="text" // Input type: text
          placeholder="Company Name" // Placeholder text displayed in the input
          value={companyName} // Controlled input: value bound to companyName state
          onChange={(e) => setCompanyName(e.target.value)} // Updates companyName state when user types
          className={styles.inputField} // Apply CSS styling
        />

        {/* Button to Fetch Interview Information */}
        <button
          onClick={handleInterviewPrep} // Trigger the handleInterviewPrep function when clicked
          className={styles.searchButton} // Apply CSS styling for the button
          disabled={loadingInterview} // Disable the button when loadingInterview is true
        >
          {loadingInterview ? "Fetching..." : "Get Interview Info"} {/* Dynamic button text */}
        </button>

        {/* Display Loading Message during API Call for Interview Information */}
        {loadingInterview && (
          <p className={styles.loadingText}>Fetching interview information...</p>
        )}

        {/* Display Interview Preparation Response */}
        {interviewResponse && (
          <div className={styles.interviewResponse}>
            <h3>Interview Information</h3>
            <p>{interviewResponse}</p> {/* Display the AI-generated interview information */}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;
