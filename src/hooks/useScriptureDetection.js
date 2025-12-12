import { useState, useEffect, useCallback } from 'react';
import { normalizeSpokenText } from '../utils/textNormalizer';
import { parseScripture } from '../utils/scriptureParser';

const useScriptureDetection = (transcript, bibleData, version) => {
  const [detectedScripture, setDetectedScripture] = useState(null);
  const [history, setHistory] = useState([]);

  // Voice Detection Logic
  useEffect(() => {
    if (!transcript || !bibleData) return;

    const cleanText = normalizeSpokenText(transcript);
    const result = parseScripture(cleanText, bibleData, version);

    if (result) {
      setDetectedScripture(prev => {
        const isNewReference = prev?.reference !== result.reference;
        const isNewText = prev?.text !== result.text;

        if (isNewReference || isNewText) {
            if (isNewReference) {
                // Add to history automatically for voice
                setHistory(h => [result, ...h].slice(0, 50));
            }
            return result;
        }
        return prev;
      });
    }
  }, [transcript, bibleData, version]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setDetectedScripture(null);
  }, []);

  // NEW: Manual Add to History
  const addToHistory = useCallback((item) => {
    setHistory(h => {
        // Prevent exact duplicates at the top of the list
        if (h.length > 0 && h[0].reference === item.reference && h[0].version === item.version) {
            return h;
        }
        return [item, ...h].slice(0, 50);
    });
  }, []);

  return { detectedScripture, history, clearHistory, addToHistory };
};

export default useScriptureDetection;