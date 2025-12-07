const SPOKEN_NUMBERS = {
  'first': '1', 'second': '2', 'third': '3',
  '1st': '1', '2nd': '2', '3rd': '3', // Added these
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
  'to': '2', 'too': '2', 'for': '4'
};

export const normalizeSpokenText = (text) => {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // 1. Convert "invest" variations to COLON
  normalized = normalized.replace(/\binvesting\b/gi, ':');
  normalized = normalized.replace(/\binvest\b/gi, ':');
  normalized = normalized.replace(/\bin verse\b/gi, ':');
  normalized = normalized.replace(/\band verse\b/gi, ':');
  // Handle "in verse" with number following
  normalized = normalized.replace(/\bin\s+(\d+)/gi, ':$1');

  // 2. Replace spoken ordinal numbers (First, 1st, Second, 2nd)
  Object.keys(SPOKEN_NUMBERS).forEach(key => {
    // We use \b boundary to match "1st" but not "1stclass"
    // We escape special chars just in case, though keys are simple here
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, SPOKEN_NUMBERS[key]);
  });

  // 3. Handle "Acts of the Apostles" variations explicitly BEFORE parsing
  // This helps clean up the long phrase into a simple "Acts"
  normalized = normalized.replace(/acts of the apostles/gi, 'acts');
  normalized = normalized.replace(/acts of the posters/gi, 'acts');
  normalized = normalized.replace(/acts of the postal/gi, 'acts');

  // 4. Remove filler words
  normalized = normalized.replace(/\bchapter\b/gi, ' ');
  normalized = normalized.replace(/\bverse\b/gi, ':');
  normalized = normalized.replace(/\band\b/gi, ' ');

  return normalized.replace(/\s+/g, ' ').trim();
};