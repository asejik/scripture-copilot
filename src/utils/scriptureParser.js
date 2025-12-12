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

      // 2. Fallback Logic for JSON Mismatch
      if (realBookKey && !bibleData[realBookKey]) {
         const jsonKeys = Object.keys(bibleData);
         let foundKey = jsonKeys.find(k => k.toLowerCase() === realBookKey.toLowerCase());
         if (!foundKey && (realBookKey.includes("Song") || realBookKey.includes("Solomon"))) {
             foundKey = jsonKeys.find(k => k.includes("Song") || k.includes("Solomon") || k.includes("Canticles"));
         }
         if (!foundKey && (realBookKey.includes("Psalm"))) {
             foundKey = jsonKeys.find(k => k.startsWith("Psalm"));
         }
         if (foundKey) realBookKey = foundKey;
      }

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
                  timestamp: Date.now(),
                  // Metadata for lookup later
                  book: realBookKey,
                  chapter: finalChapter,
                  startVerse: finalVerse,
                  endVerse: finalVerse
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
                      timestamp: Date.now(),
                      // Metadata
                      book: realBookKey,
                      chapter: finalChapter,
                      startVerse: vStart,
                      endVerse: actualEnd
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

// --- NEW: Helper to fetch text from a different version using existing metadata ---
export const fetchSecondaryText = (primaryScripture, secondaryBibleData) => {
    if (!primaryScripture || !secondaryBibleData) return null;

    // We try to find the exact same book/chapter/verse in the new data
    // 1. Try exact key match first
    let bookKey = primaryScripture.book;

    // 2. If exact key missing, try smart fallback (e.g. Psalms vs Psalm)
    if (!secondaryBibleData[bookKey]) {
         const jsonKeys = Object.keys(secondaryBibleData);
         let foundKey = jsonKeys.find(k => k.toLowerCase() === bookKey.toLowerCase());
         if (!foundKey && (bookKey.includes("Song") || bookKey.includes("Solomon"))) {
             foundKey = jsonKeys.find(k => k.includes("Song") || k.includes("Solomon"));
         }
         if (!foundKey && (bookKey.includes("Psalm"))) {
             foundKey = jsonKeys.find(k => k.startsWith("Psalm"));
         }
         if (foundKey) bookKey = foundKey;
         else return null; // Can't find the book in secondary version
    }

    const bookData = secondaryBibleData[bookKey];
    const chapterData = bookData?.[primaryScripture.chapter];

    if (!chapterData) return null;

    let combinedText = [];
    let verseList = [];

    for (let i = primaryScripture.startVerse; i <= primaryScripture.endVerse; i++) {
        if (chapterData[i]) {
            const vText = chapterData[i];
            combinedText.push(`${i} ${vText}`);
            verseList.push({ verse: i, text: vText });
        }
    }

    if (combinedText.length === 0) return null;

    return {
        text: combinedText.join(' '),
        verseList: verseList
    };
};