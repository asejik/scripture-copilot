import { useState, useEffect } from 'react';
import { normalizeSpokenText } from '../utils/textNormalizer';
import { parseScripture } from '../utils/scriptureParser';

// NEW: Accepts 'version' as the third argument
const useScriptureDetection = (transcript, bibleData, version) => {
  const [detectedScripture, setDetectedScripture] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!transcript || !bibleData) return;

    const cleanText = normalizeSpokenText(transcript);

    // Pass the version to the parser
    const result = parseScripture(cleanText, bibleData, version);

    if (result) {
      setDetectedScripture(prev => {
        const isNewReference = prev?.reference !== result.reference;
        const isNewText = prev?.text !== result.text;

        if (isNewReference || isNewText) {
            if (isNewReference) {
                setHistory(h => [result, ...h].slice(0, 10));
            }
            return result;
        }
        return prev;
      });
    }
  }, [transcript, bibleData, version]); // Re-run if version changes

  return { detectedScripture, history };
};

export default useScriptureDetection;