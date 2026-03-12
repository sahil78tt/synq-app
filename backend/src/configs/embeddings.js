// Generate text embeddings using a simple but effective approach
export async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== "string" || text.trim() === "") {
      return null;
    }

    // Create a deterministic vector from text
    const embedding = textToSemanticVector(text);

    return embedding;
  } catch (error) {
    console.log("Error generating embedding:", error.message);
    return null;
  }
}

// Enhanced semantic vector generation
function textToSemanticVector(text) {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const vector = new Array(384).fill(0);

  // Word-level encoding
  words.forEach((word, wordIndex) => {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);

      // Multiple hash functions for better distribution
      const idx1 = (charCode * 31 + wordIndex * 17 + i) % 384;
      const idx2 = (charCode * 37 + wordIndex * 19 + i * 7) % 384;
      const idx3 = (charCode * 41 + wordIndex * 23 + i * 11) % 384;

      vector[idx1] += 1.0 / (wordIndex + 1);
      vector[idx2] += 0.5 / (i + 1);
      vector[idx3] += 0.3 / Math.sqrt(word.length);
    }
  });

  // Add n-gram features for semantic similarity
  for (let n = 2; n <= Math.min(3, words.length); n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(" ");
      const hash = simpleHash(ngram);
      const idx = hash % 384;
      vector[idx] += 1.0 / n;
    }
  }

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map((val) => val / magnitude) : vector;
}

// Simple hash function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
