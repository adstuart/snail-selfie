// POST /api/upload - Upload image to Vercel Blob
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Simple auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username !== process.env.BASIC_AUTH_USER || password !== process.env.BASIC_AUTH_PASS) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  
  try {
    const { filename, file } = req.body;
    
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