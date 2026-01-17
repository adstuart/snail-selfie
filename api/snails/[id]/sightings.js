// POST /api/snails/[id]/sightings - Add sighting to a snail
import { withAuth } from '../../../lib/auth.js';
import { sql } from '../../../lib/db.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { id } = req.query;
  const { garden_location, notes, images = [] } = req.body;
  
  if (!garden_location) {
    res.status(400).json({ error: 'Garden location is required' });
    return;
  }
  
  try {
    // Create sighting
    const sightingResult = await sql.query(
      `INSERT INTO sightings (snail_id, garden_location, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, garden_location, notes]
    );
    
    const sighting = sightingResult.rows[0];
    
    // Add images if provided
    for (const image of images) {
      await sql.query(
        `INSERT INTO sighting_images (sighting_id, image_url, thumbnail_url)
         VALUES ($1, $2, $3)`,
        [sighting.id, image.url, image.thumbnail_url]
      );
    }
    
    res.status(201).json({ sighting });
  } catch (error) {
    console.error('Error creating sighting:', error);
    res.status(500).json({ error: 'Failed to create sighting' });
  }
}

export default withAuth(handler);
