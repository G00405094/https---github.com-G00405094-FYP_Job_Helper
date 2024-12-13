import React, { useState } from 'react';
import classes from './styles.module.css';

function CVForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        objective: '',
        skills: '',
        certifications: '',
        hobbies: '',
        experience: [{ title: '', company: '', startDate: '', endDate: '', responsibilities: '' }],
        education: [{ degree: '', institution: '', graduationDate: '' }],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleExperienceChange = (index, field, value) => {
        const updatedExperience = [...formData.experience];
        updatedExperience[index][field] = value;
        setFormData({ ...formData, experience: updatedExperience });
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...formData.education];
        updatedEducation[index][field] = value;
        setFormData({ ...formData, education: updatedEducation });
    };

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { title: '', company: '', startDate: '', endDate: '', responsibilities: '' }],
        });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { degree: '', institution: '', graduationDate: '' }],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form data...', formData);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Generated CV:', result.response);
                setGeneratedCV(result.response);
            } else {
                console.error('Error:', result.error);
                alert(result.error);
            }
        } catch (error) {
            console.error('Error generating CV:', error);
        }
    };

    const [generatedCV, setGeneratedCV] = useState('');

    return (
        <div className={classes.cvFormContainer}>
            <form onSubmit={handleSubmit} className={classes.cvForm}>
                <h1 className={classes.formTitle}>Create Your CV</h1>

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
                </div>

                <div className={classes.formSection}>
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

                <h2 className={classes.sectionTitle}>Experience</h2>
                {formData.experience.map((exp, index) => (
                    <div key={index} className={classes.experienceItem}>
                        <label>
                            Title:
                            <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            Company:
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            Responsibilities:
                            <textarea
                                value={exp.responsibilities}
                                onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                                className={classes.textareaField}
                            ></textarea>
                        </label>
                    </div>
                ))}
                <button type="button" onClick={addExperience} className={classes.addButton}>
                    Add Experience
                </button>

                <h2 className={classes.sectionTitle}>Education</h2>
                {formData.education.map((edu, index) => (
                    <div key={index} className={classes.educationItem}>
                        <label>
                            Degree:
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            Institution:
                            <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                className={classes.inputField}
                            />
                        </label>
                        <label>
                            Graduation Date:
                            <input
                                type="date"
                                value={edu.graduationDate}
                                onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
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

                {generatedCV && (
                    <div className={classes.generatedCvContainer}>
                        <h2 className={classes.cvTitle}>Your Generated CV</h2>
                        <pre className={classes.cvOutput}>{generatedCV}</pre>
                    </div>
                )}
            </form>
        </div>
    );
}

export default CVForm;
