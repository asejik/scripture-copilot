import { BOOK_ALIASES } from './bookMapping';

const MAX_VERSES_LIMIT = 50;

export const parseScripture = (text, bibleData, versionName) => {
  try {
    if (!text || !bibleData) return null;

    const regex = /(\d\s?)?([a-z]+)\s+(\d+)[:.\s]*(\d+)(?:\s*[-]\s*(\d+))?/gi;

    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      let [fullMatch, numberPrefix, bookName, chapter, startVerse, endVerse] = match;

      let spokenBook = numberPrefix ? `${numberPrefix.trim()} ${bookName}` : bookName;
      spokenBook = spokenBook.trim().toLowerCase();

      // 1. Resolve Alias
      let realBookKey = BOOK_ALIASES[spokenBook];

      // 2. PRIMARY CHECK: Direct Lookup
      // If direct lookup fails, we try to "find" the key in the JSON keys
      if (realBookKey && !bibleData[realBookKey]) {
         const jsonKeys = Object.keys(bibleData);

         // A. Case Insensitive Match (e.g. "song of solomon" vs "Song of Solomon")
         let foundKey = jsonKeys.find(k => k.toLowerCase() === realBookKey.toLowerCase());

         // B. "Song" Specific Fallback (If 'Song of Solomon' fails, try 'Song of Songs')
         if (!foundKey && (realBookKey.includes("Song") || realBookKey.includes("Solomon"))) {
             foundKey = jsonKeys.find(k =>
                 k.includes("Song") || k.includes("Solomon") || k.includes("Canticles")
             );
         }

         // C. "Psalm" Specific Fallback
         if (!foundKey && (realBookKey.includes("Psalm"))) {
             foundKey = jsonKeys.find(k => k.startsWith("Psalm"));
         }

         if (foundKey) {
             realBookKey = foundKey;
         }
      }

      // 3. Final Validation
      if (!realBookKey || !bibleData[realBookKey]) continue;

      const bookData = bibleData[realBookKey];
      const finalChapter = parseInt(chapter);

      if (!bookData[finalChapter]) continue;

      // --- LOGIC A: SINGLE VERSE ---
      if (!endVerse) {
           const finalVerse = parseInt(startVerse);
           if (bookData[finalChapter][finalVerse]) {
              matches.push({
                  reference: `${realBookKey} ${finalChapter}:${finalVerse}`,
                  text: bookData[finalChapter][finalVerse],
                  verseList: [{ verse: finalVerse, text: bookData[finalChapter][finalVerse] }],
                  version: versionName,
                  timestamp: Date.now()
              });
           }
      }

      // --- LOGIC B: MULTI-VERSE RANGE ---
      else {
          const vStart = parseInt(startVerse);
          const vEnd = parseInt(endVerse);

          if (vStart < vEnd && (vEnd - vStart) <= MAX_VERSES_LIMIT) {
              let combinedText = [];
              let verseList = [];
              let actualEnd = vEnd;

              for (let i = vStart; i <= vEnd; i++) {
                  if (bookData[finalChapter][i]) {
                      const vText = bookData[finalChapter][i];
                      combinedText.push(`${i} ${vText}`);
                      verseList.push({ verse: i, text: vText });
                  } else {
                      actualEnd = i - 1;
                      break;
                  }
              }

              if (combinedText.length > 0) {
                  matches.push({
                      reference: `${realBookKey} ${finalChapter}:${vStart}-${actualEnd}`,
                      text: combinedText.join(' '),
                      verseList: verseList,
                      version: versionName,
                      timestamp: Date.now()
                  });
              }
          }
      }
    }

    return matches.length > 0 ? matches[matches.length - 1] : null;

  } catch (err) {
    console.error("Parser Warning:", err);
    return null;
  }
};