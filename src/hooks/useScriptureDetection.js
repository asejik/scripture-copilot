import { useState, useEffect } from 'react';
import { normalizeSpokenText } from '../utils/textNormalizer';
import { parseScripture } from '../utils/scriptureParser';

const useScriptureDetection = (transcript, bibleData, version) => {
  const [detectedScripture, setDetectedScripture] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!transcript || !bibleData) return;

    const cleanText = normalizeSpokenText(transcript);
    const result = parseScripture(cleanText, bibleData, version);

    if (result) {
      setDetectedScripture(prev => {
        const isNewReference = prev?.reference !== result.reference;
        const isNewText = prev?.text !== result.text;

        if (isNewReference || isNewText) {
            // Add to history if it's a new reference
            if (isNewReference) {
                // Keep history unlimited or cap at 50 for the session
                setHistory(h => [result, ...h].slice(0, 50));
            }
            return result;
        }
        return prev;
      });
    }
  }, [transcript, bibleData, version]);

  // NEW: Function to manually clear history
  const clearHistory = () => {
    setHistory([]);
    setDetectedScripture(null);
  };

  // Return the new function
  return { detectedScripture, history, clearHistory };
};

export default useScriptureDetection;