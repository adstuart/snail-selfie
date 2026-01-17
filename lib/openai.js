// OpenAI client for AI features
import OpenAI from 'openai';

let openai;

export function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Estimate snail age from image
export async function estimateAge(imageUrl) {
  const client = getOpenAI();
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'You are helping kids track snails in their garden. Look at this snail photo and estimate if it is a "juvenile" (young/small), "adult" (medium/mature), or "old" (large/aged) snail. Provide a kid-friendly explanation (1-2 sentences) about why you think so, mentioning shell size, shine, wear, or color. Also rate your confidence as "low", "medium", or "high". Respond in JSON format: {"age": "juvenile|adult|old", "explanation": "...", "confidence": "low|medium|high"}'
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 300
  });

  const content = response.choices[0].message.content;
  
  // Try to parse JSON response
  try {
    const result = JSON.parse(content);
    return {
      approxAgeLabel: result.age || 'unknown',
      explanation: result.explanation || 'Unable to determine age',
      confidence: result.confidence || 'low'
    };
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      approxAgeLabel: 'unknown',
      explanation: content.substring(0, 200),
      confidence: 'low'
    };
  }
}

// Generate embedding for image identification
export async function generateEmbedding(text) {
  const client = getOpenAI();
  
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Analyze snail image for species, age, and distinctive features
export async function analyzeSnailImage(imageUrl) {
  const client = getOpenAI();
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are helping track snails in a garden. Analyze this snail photo and provide:

1. Species identification - What type of snail is this? (e.g., "Garden Snail (Cornu aspersum)", "Grove Snail (Cepaea nemoralis)", "Roman Snail", etc.)

2. Age estimate - Is this snail "juvenile" (small/young), "adult" (medium/mature), or "old" (large/aged)? Explain why in 1-2 kid-friendly sentences.

3. Distinctive features - Describe unique identifying features (shell pattern, color, size, markings, damage, etc.) that could help identify this specific individual snail.

Respond in JSON format:
{
  "species": "Garden Snail (Cornu aspersum)",
  "age": "adult",
  "ageExplanation": "This snail has a medium-sized shell with some wear marks, suggesting it's a grown-up snail.",
  "ageConfidence": "medium",
  "distinctiveFeatures": "Brown shell with darker spiral bands, small chip on the outer lip, yellowish body color"
}`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 500
  });

  const content = response.choices[0].message.content;
  
  // Try to parse JSON response
  try {
    const result = JSON.parse(content);
    return {
      species: result.species || 'Garden snail',
      age: result.age || 'unknown',
      ageExplanation: result.ageExplanation || 'Unable to determine age',
      ageConfidence: result.ageConfidence || 'low',
      distinctiveFeatures: result.distinctiveFeatures || ''
    };
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      species: 'Garden snail',
      age: 'unknown',
      ageExplanation: 'Unable to analyze image',
      ageConfidence: 'low',
      distinctiveFeatures: ''
    };
  }
}

// Compare two snail images using GPT-4 Vision
export async function compareSnailImages(imageUrl1, imageUrl2) {
  const client = getOpenAI();
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are helping identify if two photos show the same individual snail. Compare these two snail photos and determine:

1. Are these photos of the same snail? Consider shell pattern, markings, damage, size, color, and other distinctive features.
2. How confident are you? Rate from 0-100.

Respond in JSON format:
{
  "isSame": true,
  "confidence": 85,
  "reasoning": "Both snails have the same distinctive shell pattern with spiral bands and a chip on the outer lip."
}`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl1 }
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl2 }
          }
        ]
      }
    ],
    max_tokens: 300
  });

  const content = response.choices[0].message.content;
  
  // Try to parse JSON response
  try {
    const result = JSON.parse(content);
    return {
      isSame: result.isSame || false,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || ''
    };
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      isSame: false,
      confidence: 0,
      reasoning: 'Unable to compare images'
    };
  }
}
