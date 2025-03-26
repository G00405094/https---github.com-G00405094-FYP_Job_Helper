import dbConnect from '../../lib/mongodb';
import CV from '../../models/CV';

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    const testCV = await CV.create({
      name: "Test User",
      email: "test@example.com",
      generatedCV: "This is a test CV"
    });
    
    res.status(200).json({ 
      message: 'Test document created successfully', 
      id: testCV._id 
    });
  } catch (error) {
    console.error('Error creating test document:', error);
    res.status(500).json({ 
      error: 'Failed to create test document', 
      details: error.message 
    });
  }
} 