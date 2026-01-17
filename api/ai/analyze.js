// POST /api/ai/analyze - Analyze snail image for species, age, and matching
import { withAuth } from '../../lib/auth.js';
import { sql } from '../../lib/db.js';
import { analyzeSnailImage, compareSnailImages } from '../../lib/openai.js';

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
    
    // Step 1: Analyze the uploaded image for species and age
    const analysis = await analyzeSnailImage(imageUrl);
    
    // Step 2: Find potential matches by comparing to existing snail images
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
    
    // Step 3: Compare uploaded image with existing snail images using GPT-4 Vision
    const matches = [];
    for (const row of result.rows) {
      try {
        const comparison = await compareSnailImages(imageUrl, row.image_url);
        
        // Only include matches with confidence > 50%
        if (comparison.confidence > 50) {
          matches.push({
            snail_id: row.snail_id,
            snail_name: row.name,
            species_tag: row.species_tag,
            thumbnail_url: row.thumbnail_url || row.image_url,
            confidence: comparison.confidence,
            reasoning: comparison.reasoning
          });
        }
      } catch (error) {
        console.error(`Error comparing with snail ${row.snail_id}:`, error);
        // Continue with other comparisons even if one fails
      }
    }
    
    // Sort matches by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 5 matches
    const topMatches = matches.slice(0, 5);
    
    res.status(200).json({
      species: analysis.species,
      age: {
        label: analysis.age,
        explanation: analysis.ageExplanation,
        confidence: analysis.ageConfidence
      },
      distinctiveFeatures: analysis.distinctiveFeatures,
      matches: topMatches
    });
  } catch (error) {
    console.error('Error analyzing snail:', error);
    res.status(500).json({ error: 'Failed to analyze snail' });
  }
}

export default withAuth(handler);
