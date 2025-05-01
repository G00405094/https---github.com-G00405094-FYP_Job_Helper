/**
 * Smart Suggestions Component
 * 
 * This component provides context-aware suggestions for CV content:
 * - Skills based on job title and industry
 * - Action verbs for experience descriptions
 * - Industry-specific certifications
 */

import React, { useState, useEffect } from 'react';
import classes from './styles.module.css';

// Database of common skills by job role
const skillsByRole = {
  'Software Engineer': [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#', '.NET', 
    'SQL', 'NoSQL', 'Git', 'CI/CD', 'Agile', 'REST APIs', 'Cloud Platforms',
    'Docker', 'Kubernetes', 'Microservices', 'Unit Testing', 'DevOps'
  ],
  'Web Developer': [
    'HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js', 'Node.js', 
    'PHP', 'WordPress', 'SEO', 'Responsive Design', 'SASS/LESS', 'Bootstrap',
    'Webpack', 'Web Performance', 'Browser DevTools', 'Web Accessibility'
  ],
  'Data Scientist': [
    'Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization', 
    'Statistical Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'Jupyter', 'Tableau', 'Power BI', 'A/B Testing', 'Big Data Technologies'
  ],
  'Product Manager': [
    'Agile/Scrum', 'User Stories', 'Product Roadmapping', 'Market Research',
    'User Experience', 'Data Analysis', 'Competitive Analysis', 'Jira', 
    'Feature Prioritization', 'Cross-functional Collaboration', 'User Testing'
  ],
  'Marketing Specialist': [
    'Social Media Marketing', 'Content Creation', 'SEO/SEM', 'Google Analytics',
    'Email Marketing', 'Marketing Automation', 'CRM', 'Adobe Creative Suite',
    'Campaign Management', 'Market Research', 'Brand Development'
  ],
  'UX/UI Designer': [
    'Figma', 'Sketch', 'Adobe XD', 'Wireframing', 'Prototyping', 
    'User Research', 'Usability Testing', 'Information Architecture',
    'Visual Design', 'Interaction Design', 'UI Animation', 'Design Systems'
  ]
};

// Common action verbs by category
const actionVerbs = {
  achievement: [
    'Achieved', 'Attained', 'Awarded', 'Completed', 'Demonstrated', 'Earned',
    'Exceeded', 'Improved', 'Pioneered', 'Reduced', 'Resolved', 'Succeeded'
  ],
  management: [
    'Administered', 'Coordinated', 'Delegated', 'Directed', 'Executed',
    'Led', 'Managed', 'Orchestrated', 'Oversaw', 'Supervised', 'Spearheaded'
  ],
  communication: [
    'Articulated', 'Authored', 'Clarified', 'Collaborated', 'Consulted',
    'Influenced', 'Negotiated', 'Persuaded', 'Presented', 'Promoted'
  ],
  technical: [
    'Architected', 'Built', 'Coded', 'Debugged', 'Designed', 'Developed',
    'Engineered', 'Implemented', 'Programmed', 'Resolved', 'Tested'
  ],
  analytical: [
    'Analyzed', 'Assessed', 'Calculated', 'Evaluated', 'Examined',
    'Identified', 'Investigated', 'Measured', 'Researched', 'Synthesized'
  ],
  creative: [
    'Conceptualized', 'Created', 'Designed', 'Developed', 'Established',
    'Formulated', 'Innovated', 'Introduced', 'Launched', 'Pioneered'
  ]
};

// Certifications by industry
const certificationsByIndustry = {
  'technology': [
    'AWS Certified Solutions Architect', 'CompTIA A+', 'Microsoft Azure Fundamentals',
    'Google Cloud Professional', 'Certified Scrum Master', 'PMP Certification',
    'Cisco CCNA', 'ITIL Foundation', 'Certified Information Systems Security Professional (CISSP)'
  ],
  'marketing': [
    'Google Analytics Certification', 'HubSpot Inbound Marketing', 'Facebook Blueprint',
    'Google Ads Certification', 'Content Marketing Certification', 'SEMrush SEO Certification'
  ],
  'finance': [
    'Certified Public Accountant (CPA)', 'Chartered Financial Analyst (CFA)',
    'Certified Financial Planner (CFP)', 'Financial Risk Manager (FRM)',
    'Certified Management Accountant (CMA)'
  ],
  'healthcare': [
    'Registered Nurse (RN)', 'Certified Nursing Assistant (CNA)',
    'Basic Life Support (BLS)', 'Electronic Health Records Specialist',
    'Healthcare Information Management Systems'
  ],
  'design': [
    'Adobe Certified Expert', 'Certified User Experience Analyst',
    'Autodesk Certified Professional', 'Certified Web Designer'
  ]
};

// Map job titles to industries for certification suggestions
const jobToIndustry = {
  'Software Engineer': 'technology',
  'Web Developer': 'technology',
  'Data Scientist': 'technology',
  'Product Manager': 'technology',
  'UX/UI Designer': 'design',
  'Marketing Specialist': 'marketing',
  'Financial Analyst': 'finance',
  'Business Analyst': 'business',
  'Healthcare Professional': 'healthcare'
};

function SmartSuggestions({ 
  jobTitle, 
  currentInput = '',
  suggestionType = 'skills', 
  onSelectSuggestion 
}) {
  const [suggestions, setSuggestions] = useState([]);
  
  // Generate suggestions based on job title and suggestion type
  useEffect(() => {
    if (suggestionType === 'skills') {
      // Skill suggestions based on job title
      const skillSuggestions = skillsByRole[jobTitle] || [];
      setSuggestions(skillSuggestions);
    } 
    else if (suggestionType === 'actionVerbs') {
      // Action verb suggestions for experience descriptions
      const allVerbs = [
        ...actionVerbs.achievement,
        ...actionVerbs.management,
        ...actionVerbs.communication,
        ...actionVerbs.technical,
        ...actionVerbs.analytical,
        ...actionVerbs.creative
      ];
      setSuggestions(allVerbs);
    } 
    else if (suggestionType === 'certifications') {
      // Certification suggestions based on job industry
      const industry = jobToIndustry[jobTitle] || 'technology';
      const certSuggestions = certificationsByIndustry[industry] || [];
      setSuggestions(certSuggestions);
    }
  }, [jobTitle, suggestionType]);

  // If no suggestions or not needed, don't render
  if (!suggestions.length) {
    return null;
  }

  return (
    <div className={classes.suggestionsContainer}>
      <div className={classes.suggestionsHeader}>
        {suggestionType === 'skills' && 'Suggested Skills'}
        {suggestionType === 'actionVerbs' && 'Action Verbs for Impact'}
        {suggestionType === 'certifications' && 'Relevant Certifications'}
      </div>
      
      <div className={classes.suggestionChips}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            className={classes.suggestionChip}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SmartSuggestions; 