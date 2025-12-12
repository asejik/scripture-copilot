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

      // 1. Resolve Alias (e.g., "psalm" -> "Psalms")
      let realBookKey = BOOK_ALIASES[spokenBook];

      // 2. Fallback Logic for JSON Mismatch (The Fix)
      // If "Psalms" isn't in the JSON, try "Psalm". If "Song of Solomon" fails, try "Song of Songs".
      if (!bibleData[realBookKey]) {
         if (realBookKey === "Psalms" && bibleData["Psalm"]) realBookKey = "Psalm";
         else if (realBookKey === "Song of Solomon" && bibleData["Song of Songs"]) realBookKey = "Song of Songs";
         else if (realBookKey === "Revelation" && bibleData["Revelations"]) realBookKey = "Revelations";
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