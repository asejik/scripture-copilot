const SPOKEN_NUMBERS = {
  'first': '1', 'second': '2', 'third': '3',
  '1st': '1', '2nd': '2', '3rd': '3',
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
  // Removed 'to' from here, we handle it manually below
  'too': '2', 'for': '4'
};

export const normalizeSpokenText = (text) => {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // 1. RANGE DETECTION (Critical New Step)
  // Convert "16 to 19" or "16 through 19" into "16-19"
  // We do this BEFORE converting words to numbers to avoid "16 2 19"
  normalized = normalized.replace(/(\d+)\s+to\s+(\d+)/gi, '$1-$2');
  normalized = normalized.replace(/(\d+)\s+through\s+(\d+)/gi, '$1-$2');
  normalized = normalized.replace(/(\d+)\s+dash\s+(\d+)/gi, '$1-$2');

  // 2. Convert "invest" variations to COLON
  normalized = normalized.replace(/\binvesting\b/gi, ':');
  normalized = normalized.replace(/\binvest\b/gi, ':');
  normalized = normalized.replace(/\bin verse\b/gi, ':');
  normalized = normalized.replace(/\band verse\b/gi, ':');
  normalized = normalized.replace(/\bin\s+(\d+)/gi, ':$1');

  // 3. Replace spoken ordinal numbers
  Object.keys(SPOKEN_NUMBERS).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, SPOKEN_NUMBERS[key]);
  });

  // 4. Handle "to" separately (only if it wasn't used in a range above)
  // If "to" is still there, it likely means "Turn TO Genesis" (irrelevant) or "Chapter TO" (Chapter 2)
  normalized = normalized.replace(/\bto\b/gi, '2');

  // 5. Handle "Acts" variations
  normalized = normalized.replace(/acts of the apostles/gi, 'acts');
  normalized = normalized.replace(/acts of the posters/gi, 'acts');
  normalized = normalized.replace(/acts of the postal/gi, 'acts');

  // 6. Remove filler words
  normalized = normalized.replace(/\bchapter\b/gi, ' ');
  normalized = normalized.replace(/\bverse\b/gi, ':');
  normalized = normalized.replace(/\band\b/gi, ' ');
  // Identify "from verse X" pattern which implies a range might follow
  normalized = normalized.replace(/\bfrom\b/gi, ' ');

  return normalized.replace(/\s+/g, ' ').trim();
};