import { useState, useEffect } from 'react';
import { normalizeSpokenText } from '../utils/textNormalizer';
import { parseScripture } from '../utils/scriptureParser';

const useScriptureDetection = (transcript) => {
  const [detectedScripture, setDetectedScripture] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!transcript) return;

    // 1. Normalize the text (handle "First John", remove "Chapter")
    const cleanText = normalizeSpokenText(transcript);

    // 2. Attempt to parse
    const result = parseScripture(cleanText);

    if (result) {
      // 3. Only update if it's a NEW detection (prevent spamming the same verse)
      setDetectedScripture(prev => {
        if (prev?.reference !== result.reference) {
            // Add to history
            setHistory(h => [result, ...h].slice(0, 10)); // Keep last 10
            return result;
        }
        return prev;
      });
    }
  }, [transcript]);

  return { detectedScripture, history };
};

export default useScriptureDetection;