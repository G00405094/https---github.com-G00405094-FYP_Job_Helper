import dbConnect from '../../lib/mongodb';
import CV from '../../models/CV';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        // If an ID is provided, get a specific CV
        if (req.query.id) {
          const cv = await CV.findById(req.query.id);
          if (!cv) {
            return res.status(404).json({ success: false, error: 'CV not found' });
          }
          res.status(200).json({ success: true, data: cv });
        } 
        // Otherwise, get all CVs
        else {
          const cvs = await CV.find({});
          res.status(200).json({ success: true, data: cvs });
        }
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
} 