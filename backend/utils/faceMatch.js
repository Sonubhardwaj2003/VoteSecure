/**
 * Computes euclidean distance between two face descriptors (128-d vectors)
 * produced by face-api.js on the frontend.
 *
 * face-api.js convention: distance < ~0.6 generally means "same person".
 * We use a slightly stricter default (0.55) since this is a security-sensitive
 * use case (voting), configurable via FACE_MATCH_THRESHOLD in .env.
 */
function euclideanDistance(descriptorA, descriptorB) {
  if (
    !Array.isArray(descriptorA) ||
    !Array.isArray(descriptorB) ||
    descriptorA.length !== descriptorB.length
  ) {
    throw new Error("Invalid face descriptors for comparison");
  }

  let sum = 0;
  for (let i = 0; i < descriptorA.length; i++) {
    const diff = descriptorA[i] - descriptorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function isFaceMatch(descriptorA, descriptorB) {
  const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.55;
  const distance = euclideanDistance(descriptorA, descriptorB);
  return { match: distance < threshold, distance, threshold };
}

module.exports = { euclideanDistance, isFaceMatch };
