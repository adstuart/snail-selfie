// POST /api/upload - Upload image to Vercel Blob
import { put } from '@vercel/blob';
import { withAuth } from '../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Parse body if it's a string (Vercel doesn't always auto-parse JSON)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        res.status(400).json({ error: 'Invalid JSON in request body' });
        return;
      }
    }
    
    const { filename, file } = body;
    
    if (!filename || !file) {
      res.status(400).json({ error: 'Filename and file data required' });
      return;
    }
    
    const buffer = Buffer.from(file, 'base64');
    
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });
    
    res.status(200).json({
      url: blob.url,
      thumbnail_url: blob.url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
}

export default withAuth(handler);