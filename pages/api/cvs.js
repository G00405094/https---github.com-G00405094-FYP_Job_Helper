import dbConnect from '../../lib/mongodb';
import CV from '../../models/CV';
import { withSessionRoute, getUserFromSession } from '../../lib/session';

async function handler(req, res) {
  const { method } = req;

  // Connect to the database
  await dbConnect();

  // Get the logged in user
  const user = await getUserFromSession(req);
  
  // Check if user is authenticated
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  switch (method) {
    case 'GET':
      try {
        // If an ID is provided, get a specific CV
        if (req.query.id) {
          const cv = await CV.findOne({
            _id: req.query.id,
            user: user.id // Only return CV if it belongs to the logged in user
          });
          
          if (!cv) {
            return res.status(404).json({ success: false, error: 'CV not found' });
          }
          
          res.status(200).json({ success: true, data: cv });
        } 
        // Otherwise, get all CVs for the current user
        else {
          const cvs = await CV.find({ user: user.id });
          res.status(200).json({ success: true, data: cvs });
        }
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // Create a new CV and associate it with the current user
        const cvData = {
          ...req.body,
          user: user.id // Add the user ID to the CV data
        };
        
        const cv = await CV.create(cvData);
        res.status(201).json({ success: true, data: cv });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        // Update an existing CV (only if it belongs to the current user)
        const cv = await CV.findOneAndUpdate(
          { _id: req.body._id, user: user.id },
          req.body,
          { new: true, runValidators: true }
        );
        
        if (!cv) {
          return res.status(404).json({ success: false, error: 'CV not found' });
        }
        
        res.status(200).json({ success: true, data: cv });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        // Delete a CV (only if it belongs to the current user)
        const deletedCV = await CV.findOneAndDelete({ 
          _id: req.query.id,
          user: user.id
        });
        
        if (!deletedCV) {
          return res.status(404).json({ success: false, error: 'CV not found' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}

export default withSessionRoute(handler); 