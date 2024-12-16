import React, { useState } from "react";
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

  return (
    <div className={styles.jobSearchContainer}>
  {/* Main Container for the Job Search Component */}
  
  {/* Job Search Section */}
  <h1 className={styles.heading}>Search for Jobs</h1>
  
  <div className={styles.searchFields}>
    {/* Input Field for Job Title */}
    <input
      type="text" // Input type: text
      placeholder="Job Title" // Placeholder text displayed in the input
      value={jobTitle} // Controlled input: value bound to jobTitle state
      onChange={(e) => setJobTitle(e.target.value)} // Updates jobTitle state when user types
      className={styles.inputField} // Apply CSS styling
    />

    {/* Input Field for Location */}
    <input
      type="text" // Input type: text
      placeholder="Location" // Placeholder text displayed in the input
      value={location} // Controlled input: value bound to location state
      onChange={(e) => setLocation(e.target.value)} // Updates location state when user types
      className={styles.inputField} // Apply CSS styling
    />

    {/* Search Button */}
    <button
      onClick={handleSearch} // Trigger the handleSearch function when clicked
      className={styles.searchButton} // Apply CSS styling for the button
      disabled={loading} // Disable the button when loading state is true
    >
      {loading ? "Searching..." : "Search"} {/* Dynamic button text based on loading state */}
    </button>
  </div>

  {/* Display Loading Message while Fetching Job Listings */}
  {loading && (
    <p className={styles.loadingText}>Fetching job listings...</p>
  )}

  {/* Display Job Results */}
  <div className={styles.jobResults}>
    {jobs.map((job, index) => ( // Iterate through the jobs array and render each job
      <div key={index} className={styles.jobItem}>
        {/* Job Title */}
        <h3>{job.title}</h3>

        {/* Display Company Name */}
        <p>
          <strong>Company:</strong>{" "}
          {job.company_name || "Not specified"} {/* Default to "Not specified" if no company_name */}
        </p>

        {/* Display Job Location */}
        <p>
          <strong>Location:</strong>{" "}
          {job.location || "Not specified"} {/* Default to "Not specified" if no location */}
        </p>

        {/* External Link to Job */}
        <a
          href={job.url} // Job URL provided in the job object
          target="_blank" // Open link in a new tab
          rel="noopener noreferrer" // Security measure: prevents tab access and referrer leaks
        >
          View Job
        </a>
      </div>
    ))}
  </div>

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
