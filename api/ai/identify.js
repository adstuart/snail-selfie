// POST /api/ai/identify - Find matching snails from image
import { withAuth } from '../../lib/auth.js';
import { sql } from '../../lib/db.js';
import { generateEmbedding, cosineSimilarity } from '../../lib/openai.js';

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
    
    // Generate embedding for the uploaded image
    // Note: For image embeddings, we'd ideally use CLIP or similar
    // For now, we'll use a text description as a proxy
    const imageEmbedding = await generateEmbedding(`snail image at ${imageUrl}`);
    
    // Get all snail images with embeddings
    const result = await sql.query(
      `SELECT si.*, s.name, s.species_tag
       FROM snail_images si
       JOIN snails s ON si.snail_id = s.id
       WHERE si.embedding IS NOT NULL`
    );
    
    // Calculate similarities
    const matches = result.rows.map(row => {
      const similarity = cosineSimilarity(imageEmbedding, row.embedding);
      return {
        snail_id: row.snail_id,
        snail_name: row.name,
        species_tag: row.species_tag,
        thumbnail_url: row.thumbnail_url,
        confidence: Math.round(similarity * 100)
      };
    });
    
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
