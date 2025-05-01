/**
 * CV Preview Component
 * 
 * This component renders a live preview of the CV as users fill out the form.
 * It takes the form data as props and displays it in a formatted layout.
 * Different templates can be applied to change the visual presentation.
 */

import React from 'react';
import classes from './styles.module.css';

const templates = {
  professional: {
    className: classes.previewProfessional,
    headerClass: classes.headerProfessional,
    sectionClass: classes.sectionProfessional,
    titleClass: classes.titleProfessional
  },
  creative: {
    className: classes.previewCreative,
    headerClass: classes.headerCreative,
    sectionClass: classes.sectionCreative,
    titleClass: classes.titleCreative
  },
  technical: {
    className: classes.previewTechnical,
    headerClass: classes.headerTechnical,
    sectionClass: classes.sectionTechnical,
    titleClass: classes.titleTechnical
  },
  minimalist: {
    className: classes.previewMinimalist,
    headerClass: classes.headerMinimalist,
    sectionClass: classes.sectionMinimalist,
    titleClass: classes.titleMinimalist
  }
};

function CVPreview({ formData, template = 'professional' }) {
  const templateStyles = templates[template] || templates.professional;
  
  // Helper function to check if a section has content
  const hasContent = (section) => {
    if (Array.isArray(section)) {
      return section.length > 0 && section.some(item => 
        Object.values(item).some(value => value.trim() !== '')
      );
    }
    return section && section.trim() !== '';
  };

  return (
    <div className={`${classes.previewContainer} ${templateStyles.className}`}>
      {/* Header Section */}
      <div className={templateStyles.headerClass}>
        <h1 className={classes.previewName}>{formData.name || 'Your Name'}</h1>
        
        <div className={classes.previewContact}>
          {formData.email && <div>{formData.email}</div>}
          {formData.phone && <div>{formData.phone}</div>}
          {formData.linkedin && <div>{formData.linkedin}</div>}
        </div>
      </div>

      {/* Objective/Summary Section */}
      {hasContent(formData.objective) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Professional Summary</h2>
          <p className={classes.previewObjective}>{formData.objective}</p>
        </div>
      )}

      {/* Skills Section */}
      {hasContent(formData.skills) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Skills</h2>
          <p className={classes.previewSkills}>{formData.skills}</p>
        </div>
      )}

      {/* Experience Section */}
      {hasContent(formData.experience) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className={classes.previewExperience}>
              {(exp.title || exp.company) && (
                <div className={classes.previewJobHeader}>
                  <strong>{exp.title}</strong>
                  {exp.title && exp.company && <span> | </span>}
                  {exp.company && <span>{exp.company}</span>}
                </div>
              )}
              
              {(exp.startDate || exp.endDate) && (
                <div className={classes.previewJobDates}>
                  {exp.startDate && <span>{exp.startDate}</span>}
                  {exp.startDate && exp.endDate && <span> - </span>}
                  {exp.endDate && <span>{exp.endDate}</span>}
                </div>
              )}
              
              {exp.responsibilities && (
                <p className={classes.previewResponsibilities}>
                  {exp.responsibilities}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {hasContent(formData.education) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Education</h2>
          {formData.education.map((edu, index) => (
            <div key={index} className={classes.previewEducation}>
              {(edu.degree || edu.institution) && (
                <div className={classes.previewEduHeader}>
                  <strong>{edu.degree}</strong>
                  {edu.degree && edu.institution && <span> | </span>}
                  {edu.institution && <span>{edu.institution}</span>}
                </div>
              )}
              
              {edu.graduationDate && (
                <div className={classes.previewEduDate}>
                  {edu.graduationDate}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications Section */}
      {hasContent(formData.certifications) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Certifications</h2>
          <p className={classes.previewCertifications}>{formData.certifications}</p>
        </div>
      )}

      {/* Hobbies Section */}
      {hasContent(formData.hobbies) && (
        <div className={templateStyles.sectionClass}>
          <h2 className={templateStyles.titleClass}>Interests & Activities</h2>
          <p className={classes.previewHobbies}>{formData.hobbies}</p>
        </div>
      )}
    </div>
  );
}

export default CVPreview; 