const SPOKEN_NUMBERS = {
  'first': '1', 'second': '2', 'third': '3',
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
};

export const normalizeSpokenText = (text) => {
  if (!text) return '';

  // 1. Convert to lowercase for easier matching
  let normalized = text.toLowerCase();

  // 2. Replace spoken ordinal numbers (First John -> 1 John)
  Object.keys(SPOKEN_NUMBERS).forEach(key => {
    // Look for whole words only
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, SPOKEN_NUMBERS[key]);
  });

  // 3. Remove common filler words in references like "chapter" and "verse"
  // "John chapter 3 verse 16" -> "John 3 16"
  normalized = normalized.replace(/\bchapter\b/gi, '');
  normalized = normalized.replace(/\bverse\b/gi, ':'); // Convert "verse" to colon for easier parsing

  return normalized;
};