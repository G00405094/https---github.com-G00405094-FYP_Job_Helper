import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  startDate: String,
  endDate: String,
  responsibilities: String,
});

const EducationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  graduationDate: String,
});

const CVSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  linkedin: String,
  objective: String,
  skills: String,
  certifications: String,
  hobbies: String,
  experience: [ExperienceSchema],
  education: [EducationSchema],
  generatedCV: String,
  createdAt: { type: Date, default: Date.now },
});

// Prevent errors when model is already defined
export default mongoose.models.CV || mongoose.model('CV', CVSchema); 