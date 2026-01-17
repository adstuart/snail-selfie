// POST /api/ai/estimate-age - Estimate snail age from image
import { withAuth } from '../../lib/auth.js';
import { estimateAge } from '../../lib/openai.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }
    
    const result = await estimateAge(imageUrl);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error estimating age:', error);
    res.status(500).json({ error: 'Failed to estimate age' });
  }
}

export default withAuth(handler);
