import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    // Try to connect to MongoDB
    const mongoose = await dbConnect();
    
    // If successful, return success message
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB connection successful',
      version: mongoose.version,
      connection: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
    });
  } catch (error) {
    console.error('MongoDB test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
} 