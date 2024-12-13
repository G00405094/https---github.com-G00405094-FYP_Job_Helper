import React, { useState } from "react";
import styles from "./JobSearch.module.css";

function JobSearch() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!jobTitle || !location) {
      alert("Please enter both job title and location.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/search-jobs?query=${encodeURIComponent(
          jobTitle
        )}&location=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.length > 0) {
        setJobs(data);
      } else {
        alert("No jobs found for the given criteria.");
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("An error occurred while fetching job data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.jobSearchContainer}>
      <h1 className={styles.heading}>Search for Jobs</h1>
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
          className={styles.searchButton}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {loading && <p className={styles.loadingText}>Fetching job listings...</p>}
      <div className={styles.jobResults}>
        {jobs.map((job, index) => (
          <div key={index} className={styles.jobItem}>
            <h3>{job.title}</h3>
            <p><strong>Company:</strong> {job.company_name || "Not specified"}</p>
            <p><strong>Location:</strong> {job.location || "Not specified"}</p>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Job
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobSearch;
