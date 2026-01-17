// DELETE /api/sightings/[id] - Delete a sighting
import { withAuth } from '../../../lib/auth.js';
import { sql } from '../../../lib/db.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { id } = req.query;
  
  try {
    const result = await sql.query(
      `DELETE FROM sightings WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sighting not found' });
      return;
    }
    
    res.status(200).json({ message: 'Sighting deleted successfully' });
  } catch (error) {
    console.error('Error deleting sighting:', error);
    res.status(500).json({ error: 'Failed to delete sighting' });
  }
}

export default withAuth(handler);
