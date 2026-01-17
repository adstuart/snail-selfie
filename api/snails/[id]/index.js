// GET /api/snails/[id] - Get snail detail with sightings
// PUT /api/snails/[id] - Update snail
// DELETE /api/snails/[id] - Delete snail
import { withAuth } from '../../../lib/auth.js';
import { sql } from '../../../lib/db.js';

async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res, id) {
  try {
    // Get snail
    const snailResult = await sql.query(
      `SELECT * FROM snails WHERE id = $1`,
      [id]
    );
    
    if (snailResult.rows.length === 0) {
      res.status(404).json({ error: 'Snail not found' });
      return;
    }
    
    const snail = snailResult.rows[0];
    
    // Get images
    const imagesResult = await sql.query(
      `SELECT * FROM snail_images WHERE snail_id = $1 ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );
    
    // Get sightings with images
    const sightingsResult = await sql.query(
      `SELECT s.*, 
              json_agg(
                json_build_object('id', si.id, 'image_url', si.image_url, 'thumbnail_url', si.thumbnail_url)
                ORDER BY si.created_at
              ) FILTER (WHERE si.id IS NOT NULL) as images
       FROM sightings s
       LEFT JOIN sighting_images si ON s.id = si.sighting_id
       WHERE s.snail_id = $1
       GROUP BY s.id
       ORDER BY s.timestamp DESC`,
      [id]
    );
    
    res.status(200).json({
      snail: {
        ...snail,
        images: imagesResult.rows,
        sightings: sightingsResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting snail:', error);
    res.status(500).json({ error: 'Failed to get snail' });
  }
}

async function handlePut(req, res, id) {
  try {
    const { name, species_tag, notes, approx_age, age_explanation, age_confidence } = req.body;
    
    const result = await sql.query(
      `UPDATE snails 
       SET name = COALESCE($1, name),
           species_tag = COALESCE($2, species_tag),
           notes = COALESCE($3, notes),
           approx_age = COALESCE($4, approx_age),
           age_explanation = COALESCE($5, age_explanation),
           age_confidence = COALESCE($6, age_confidence),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, species_tag, notes, approx_age, age_explanation, age_confidence, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Snail not found' });
      return;
    }
    
    res.status(200).json({ snail: result.rows[0] });
  } catch (error) {
    console.error('Error updating snail:', error);
    res.status(500).json({ error: 'Failed to update snail' });
  }
}

async function handleDelete(req, res, id) {
  try {
    const result = await sql.query(
      `DELETE FROM snails WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Snail not found' });
      return;
    }
    
    res.status(200).json({ message: 'Snail deleted successfully' });
  } catch (error) {
    console.error('Error deleting snail:', error);
    res.status(500).json({ error: 'Failed to delete snail' });
  }
}

export default withAuth(handler);
