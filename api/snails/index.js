// GET /api/snails - List all snails
// POST /api/snails - Create new snail
import { withAuth } from '../../lib/auth.js';
import { sql } from '../../lib/db.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const { search, sortBy = 'name' } = req.query;
    
    let query = `
      SELECT s.*, 
             si.image_url as primary_image,
             (SELECT MAX(timestamp) FROM sightings WHERE snail_id = s.id) as last_seen
      FROM snails s
      LEFT JOIN snail_images si ON s.id = si.snail_id AND si.is_primary = true
    `;
    
    const params = [];
    
    if (search) {
      query += ` WHERE s.name ILIKE $1 OR s.species_tag ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    if (sortBy === 'last_seen') {
      query += ` ORDER BY last_seen DESC NULLS LAST`;
    } else {
      query += ` ORDER BY s.name ASC`;
    }
    
    const result = await sql.query(query, params);
    
    res.status(200).json({ snails: result.rows });
  } catch (error) {
    console.error('Error listing snails:', error);
    res.status(500).json({ error: 'Failed to list snails' });
  }
}

async function handlePost(req, res) {
  try {
    const { name, species_tag = 'Garden snail', notes, approx_age, age_explanation, age_confidence, images = [] } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    if (!images || images.length === 0) {
      res.status(400).json({ error: 'At least one image is required' });
      return;
    }
    
    // Create snail
    const snailResult = await sql.query(
      `INSERT INTO snails (name, species_tag, approx_age, age_explanation, age_confidence, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, species_tag, approx_age, age_explanation, age_confidence, notes]
    );
    
    const snail = snailResult.rows[0];
    
    // Add images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await sql.query(
        `INSERT INTO snail_images (snail_id, image_url, thumbnail_url, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [snail.id, image.url, image.thumbnail_url, i === 0]
      );
    }
    
    res.status(201).json({ snail });
  } catch (error) {
    console.error('Error creating snail:', error);
    res.status(500).json({ error: 'Failed to create snail' });
  }
}

export default withAuth(handler);
