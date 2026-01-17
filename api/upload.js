// POST /api/upload - Upload image to Vercel Blob
import { withAuth } from '../lib/auth.js';
import { put } from '@vercel/blob';

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { filename, file } = req.body;
    
    if (!filename || !file) {
      res.status(400).json({ error: 'Filename and file data required' });
      return;
    }
    
    // Decode base64 file
    const buffer = Buffer.from(file, 'base64');
    
    // Upload to Vercel Blob
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