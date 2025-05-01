/**
 * Template Selector Component
 * 
 * This component allows users to select from different CV template styles.
 * It displays visual thumbnails for each template option.
 */

import React from 'react';
import classes from './styles.module.css';

// Template options with descriptions
const templates = [
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'A classic template suitable for traditional industries such as finance, law, and business.',
    tags: ['corporate', 'traditional', 'formal']
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    description: 'A bold design with creative elements for roles in design, media, and marketing.',
    tags: ['modern', 'bold', 'artistic']
  },
  { 
    id: 'technical', 
    name: 'Technical', 
    description: 'A template emphasizing skills and technical capabilities for IT, engineering, and science roles.',
    tags: ['structured', 'detailed', 'skills-focused']
  },
  { 
    id: 'minimalist', 
    name: 'Minimalist', 
    description: 'A clean, simple layout that focuses on content over design. Versatile for most industries.',
    tags: ['clean', 'simple', 'versatile']
  }
];

function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  return (
    <div className={classes.templateSelector}>
      <h3 className={classes.templateSelectorTitle}>Select a Template</h3>
      
      <div className={classes.templateGrid}>
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`${classes.templateCard} ${selectedTemplate === template.id ? classes.templateCardSelected : ''}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className={classes.templateThumbnail}>
              {/* Template thumbnail preview */}
              <div className={`${classes.thumbnailPreview} ${classes[`thumbnail${template.name}`]}`}>
                <div className={classes.thumbnailHeader}></div>
                <div className={classes.thumbnailContent}>
                  <div className={classes.thumbnailLine}></div>
                  <div className={classes.thumbnailLine}></div>
                  <div className={classes.thumbnailLine}></div>
                </div>
              </div>
            </div>
            
            <div className={classes.templateInfo}>
              <h4 className={classes.templateName}>{template.name}</h4>
              <p className={classes.templateDescription}>{template.description}</p>
              
              <div className={classes.templateTags}>
                {template.tags.map((tag, index) => (
                  <span key={index} className={classes.templateTag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector; 