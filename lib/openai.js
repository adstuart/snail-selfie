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
