import bibleData from '../data/kjv.json';
import { BOOK_ALIASES } from './bookMapping';

export const parseScripture = (text) => {
  if (!text) return null;

  // Regex matches: "1 John 3 16" or "John 3:16"
  // (\d\s?)?     -> Optional "1 "
  // ([a-z]+)     -> Book name
  // \s+          -> Space
  // (\d+)        -> Chapter
  // [:.\s]* -> Separator
  // (\d+)        -> Verse (Optional for now to catch "Leviticus 39")
  const regex = /(\d\s?)?([a-z]+)\s+(\d+)[:.\s]*(\d*)/gi;

  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    let [fullMatch, numberPrefix, bookName, chapter, verse] = match;

    // Construct the spoken book name (e.g. "1 john")
    let spokenBook = numberPrefix ? `${numberPrefix.trim()} ${bookName}` : bookName;
    spokenBook = spokenBook.trim().toLowerCase();

    // LOOKUP 1: Check the Alias Map
    // This turns "revelations" -> "Revelation"
    const realBookKey = BOOK_ALIASES[spokenBook];

    if (realBookKey && bibleData[realBookKey]) {
        let finalChapter = parseInt(chapter);
        let finalVerse = verse ? parseInt(verse) : null;
        const bookData = bibleData[realBookKey];

        // Logic A: Standard "Chapter:Verse" (e.g., John 3:16)
        if (finalVerse && bookData[finalChapter]?.[finalVerse]) {
            matches.push({
                reference: `${realBookKey} ${finalChapter}:${finalVerse}`,
                text: bookData[finalChapter][finalVerse],
                timestamp: Date.now()
            });
            continue;
        }

        // Logic B: "Merged Numbers" (e.g., "Revelation 320" -> 3:20)
        // If we have a chapter but no verse, OR the chapter doesn't exist (Chapter 320)
        if (!bookData[finalChapter] || (!finalVerse && chapter.length >= 2)) {
            // Try splitting the "Chapter" string
            const numStr = chapter.toString();

            // Try splitting at index 1 (e.g. 320 -> 3:20, 49 -> 4:9)
            // We prioritize matching the longest possible chapter that actually exists

            // Split "320" -> try "3" and "20"
            let tryChap = parseInt(numStr.substring(0, numStr.length - 2) || numStr[0]);
            let tryVerse = parseInt(numStr.substring(numStr.length - 2) || numStr.slice(1));

            // Adjust split logic for 3 digits specifically (e.g. 119 -> 1:19)
            if (numStr.length === 3) {
                 tryChap = parseInt(numStr[0]);
                 tryVerse = parseInt(numStr.slice(1));
            } else if (numStr.length === 2) {
                 tryChap = parseInt(numStr[0]);
                 tryVerse = parseInt(numStr[1]);
            }

            if (bookData[tryChap]?.[tryVerse]) {
                matches.push({
                    reference: `${realBookKey} ${tryChap}:${tryVerse}`,
                    text: bookData[tryChap][tryVerse],
                    timestamp: Date.now()
                });
            }
        }
    }
  }

  return matches.length > 0 ? matches[matches.length - 1] : null;
};