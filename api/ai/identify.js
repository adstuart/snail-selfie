// POST /api/ai/identify - Find matching snails from image using GPT-4 Vision
import { withAuth } from '../../lib/auth.js';
import { sql } from '../../lib/db.js';
import { compareSnailImages } from '../../lib/openai.js';

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
    
    // Get all snail images (prioritize primary images)
    const result = await sql.query(
      `SELECT si.image_url, si.thumbnail_url, s.id as snail_id, s.name, s.species_tag
       FROM snail_images si
       JOIN snails s ON si.snail_id = s.id
       WHERE si.is_primary = true OR si.id IN (
         SELECT MIN(id) FROM snail_images GROUP BY snail_id
       )
       ORDER BY s.created_at DESC
       LIMIT 20`
    );
    
    // Compare uploaded image with existing snail images using GPT-4 Vision
    const comparisonPromises = result.rows.map(async (row) => {
      try {
        const comparison = await compareSnailImages(imageUrl, row.image_url);
        
        // Only include matches with confidence > 50%
        if (comparison.confidence > 50) {
          return {
            snail_id: row.snail_id,
            snail_name: row.name,
            species_tag: row.species_tag,
            thumbnail_url: row.thumbnail_url || row.image_url,
            confidence: comparison.confidence,
            reasoning: comparison.reasoning
          };
        }
        return null;
      } catch (error) {
        console.error(`Error comparing with snail ${row.snail_id}:`, error);
        return null;
      }
    });
    
    // Wait for all comparisons to complete
    const comparisonResults = await Promise.allSettled(comparisonPromises);
    
    // Extract successful matches
    const matches = comparisonResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    // Sort by confidence and take top 5
    matches.sort((a, b) => b.confidence - a.confidence);
    const topMatches = matches.slice(0, 5);
    
    res.status(200).json({ matches: topMatches });
  } catch (error) {
    console.error('Error identifying snail:', error);
    res.status(500).json({ error: 'Failed to identify snail' });
  }
}

export default withAuth(handler);
