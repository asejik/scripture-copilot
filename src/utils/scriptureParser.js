import bibleData from '../data/kjv.json'; // Importing the JSON file directly

// List of books to validate against (prevents false positives like "James went to the store")
// We get these keys from your JSON file
const VALID_BOOKS = Object.keys(bibleData).map(b => b.toLowerCase());

export const parseScripture = (text) => {
  if (!text) return null;

  // Regex Breakdown:
  // (\d\s?)?       -> Optional number prefix (e.g., "1" in "1 John")
  // ([a-z]+)       -> The Book Name (e.g., "John")
  // \s+            -> Space
  // (\d+)          -> Chapter Number
  // [:.\s]+        -> Separator (colon, dot, or space)
  // (\d+)          -> Verse Number
  const regex = /(\d\s?)?([a-z]+)\s+(\d+)[:.\s]+(\d+)/gi;

  let match;
  const results = [];

  // Iterate through all matches in the text
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, numberPrefix, bookName, chapter, verse] = match;

    // Construct the book name (e.g., "1 john" or just "john")
    let cleanBookName = numberPrefix ? `${numberPrefix.trim()} ${bookName}` : bookName;
    cleanBookName = cleanBookName.trim().toLowerCase();

    // Verification: Is this actually a Bible book?
    // We check if our JSON has this book (fuzzy match could be added later)
    const validBookKey = Object.keys(bibleData).find(key =>
      key.toLowerCase() === cleanBookName
    );

    if (validBookKey) {
      // Look up the text in the JSON
      // Safety checks using Optional Chaining (?.)
      const verseText = bibleData[validBookKey]?.[chapter]?.[verse];

      if (verseText) {
        results.push({
          reference: `${validBookKey} ${chapter}:${verse}`,
          text: verseText,
          timestamp: Date.now()
        });
      }
    }
  }

  // Return the most recent match found in this chunk
  return results.length > 0 ? results[results.length - 1] : null;
};