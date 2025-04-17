import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './styles.module.css';
import { FaFileUpload, FaCloudUploadAlt, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const CVGrader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [file, setFile] = useState(null);
  const [cvText, setCVText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  // Process the file
  const handleFile = async (fileObj) => {
    // Check file type
    if (!fileObj.name.toLowerCase().endsWith('.pdf') && 
        !fileObj.name.toLowerCase().endsWith('.docx') && 
        !fileObj.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Check file size (max 5MB)
    if (fileObj.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setFile(fileObj);
    setError(null);
    
    try {
      // For simplicity, we'll use a FileReader to extract text
      // In a production environment, you'd use a proper document parser
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // For TXT files, this works directly
        // For PDF/DOCX, this is simplified for the example
        // In real implementation, you would use pdf.js or docx library
        const text = e.target.result;
        setCVText(text);
      };
      
      reader.readAsText(fileObj);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Could not read file contents');
    }
  };

  // Submit CV for grading
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvText || cvText.trim() === '') {
      setError('No CV text to analyze. Please upload a valid file.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/grade-cv', { cvText });
      setResults(response.data);
    } catch (err) {
      console.error('Error grading CV:', err);
      setError(err.response?.data?.error || 'Failed to grade your CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert score to a letter grade
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

  // Clear the current results and file
  const handleReset = () => {
    setFile(null);
    setCVText('');
    setResults(null);
    setError(null);
  };

  // Determine if user is ready to grade
  const isReadyToGrade = cvText && cvText.trim() !== '';

  return (
    <div className={styles.cvGraderContainer}>
      <h2>CV Grading Tool</h2>
      <p className={styles.formDescription}>
        Upload your CV to receive an AI-powered professional assessment with actionable feedback.
      </p>

      {!results ? (
        <form onSubmit={handleSubmit}>
          <div 
            className={`${styles.fileUploadContainer} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              id="cv-file" 
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <label htmlFor="cv-file" className={styles.fileLabel}>
              {file ? (
                <>
                  <FaFileUpload size={30} />
                  <p>Selected: {file.name}</p>
                  <span className={styles.changeFileText}>Click to change file</span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt size={40} />
                  <p>Drag & drop your CV here or click to browse</p>
                  <span>Accepts PDF, DOCX, or TXT (max 5MB)</span>
                </>
              )}
            </label>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button 
            type="submit" 
            className={styles.gradeCVButton}
            disabled={!isReadyToGrade || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Grade My CV'}
          </button>
        </form>
      ) : (
        <div className={styles.gradingResults}>
          <div className={styles.scoreHeader}>
            <div className={styles.scoreDisplay}>
              <div className={styles.scoreValue}>{results.overallScore}</div>
              <div className={styles.letterGrade}>{getLetterGrade(results.overallScore)}</div>
            </div>
            <h3>CV Assessment Results</h3>
          </div>
          
          <div className={styles.sectionScores}>
            {results.sections.map((section, index) => (
              <div key={index} className={styles.sectionScore}>
                <div className={styles.sectionHeader}>
                  <h4>{section.name}</h4>
                  <div className={styles.sectionScoreValue}>
                    {section.score}/{section.maxScore}
                  </div>
                </div>
                <p>{section.feedback}</p>
              </div>
            ))}
          </div>
          
          <div className={styles.improvementSection}>
            <h3>Key Improvement Suggestions</h3>
            <ul className={styles.suggestionsList}>
              {results.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className={styles.suggestionItem}>
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.description}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <button className={styles.resetButton} onClick={handleReset}>
            Grade Another CV
          </button>
        </div>
      )}
    </div>
  );
};

export default CVGrader; 