import React, { useEffect, useRef, useState } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useScriptureDetection from '../../hooks/useScriptureDetection';
import { useProjection } from '../../context/ProjectionContext';
import { normalizeSpokenText } from '../../utils/textNormalizer';
import { parseScripture } from '../../utils/scriptureParser';

import kjvData from '../../data/kjv.json';
import nivData from '../../data/niv.json';
import nkjvData from '../../data/nkjv.json';
import ampData from '../../data/amp.json';
import esvData from '../../data/esv.json';
import nltData from '../../data/nlt.json';
import gwData from '../../data/gw.json';

const AudioMonitor = () => {
  const [version, setVersion] = useState('KJV');
  const [manualInput, setManualInput] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [previewScripture, setPreviewScripture] = useState(null);

  const getBibleData = () => {
    switch(version) {
      case 'KJV': return kjvData;
      case 'NIV': return nivData;
      case 'NKJV': return nkjvData;
      case 'AMP': return ampData;
      case 'ESV': return esvData;
      case 'NLT': return nltData;
      case 'GW': return gwData;
      default: return kjvData;
    }
  };

  const currentBibleData = getBibleData();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition();

  // Get clearHistory from the hook
  const { detectedScripture, history, clearHistory } = useScriptureDetection(
    transcript + ' ' + interimTranscript,
    currentBibleData,
    version
  );

  const {
    projectScripture,
    clearProjection,
    nextSlide,
    prevSlide,
    currentSlideIndex,
    totalSlides,
    liveScripture,
    fontSize,
    updateFontSize
  } = useProjection();

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimTranscript]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    setSearchError(null);
    setPreviewScripture(null);

    if (!manualInput.trim()) return;

    const cleanText = normalizeSpokenText(manualInput);
    const result = parseScripture(cleanText, currentBibleData, version);

    if (result) {
        setPreviewScripture(result);
    } else {
        setSearchError(`Scripture not found in ${version}. Check spelling.`);
    }
  };

  const confirmProjection = () => {
    if (previewScripture) {
        projectScripture(previewScripture);
        setPreviewScripture(null);
        setManualInput('');
    }
  };

  // --- NEW: EXPORT LOGIC ---
  const exportHistory = () => {
    if (history.length === 0) return;

    // Create the text content
    const date = new Date().toLocaleDateString();
    let content = `SERMON SCRIPTURE NOTES - ${date}\n\n`;

    // Loop through history (reversed so it's chronological: first verse first)
    [...history].reverse().forEach((item, index) => {
        content += `${index + 1}. ${item.reference} (${item.version})\n`;
        content += `"${item.text}"\n\n`;
    });

    // Create a download link
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `sermon-notes-${Date.now()}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">

      {/* LEFT COLUMN */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">🎙️ Live Audio</h2>

            <div className="flex items-center gap-3">
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="bg-slate-900 text-white text-sm font-bold py-1 px-3 rounded border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="KJV">KJV</option>
                <option value="NIV">NIV</option>
                <option value="NKJV">NKJV</option>
                <option value="AMP">AMP</option>
                <option value="ESV">ESV</option>
                <option value="NLT">NLT</option>
                <option value="GW">GW</option>
              </select>

              <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs text-slate-400 w-12">{isListening ? 'ON AIR' : 'OFF'}</span>
              </div>
            </div>
        </div>

        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed">
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <span className="text-slate-300">{transcript}</span>
            <span className="text-emerald-400 italic"> {interimTranscript}</span>
            <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col gap-3">
            <div className="flex gap-3">
                <button onClick={isListening ? stopListening : startListening} className={`px-4 py-2 rounded-lg font-medium text-white transition-colors cursor-pointer flex-1 ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{isListening ? 'Stop Mic' : 'Start Mic'}</button>
                <button onClick={resetTranscript} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 cursor-pointer">Clear Text</button>
            </div>

            <form onSubmit={handleManualSearch} className="flex gap-2 relative">
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Type reference (e.g. John 3:16)..."
                    className="flex-1 bg-slate-950 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none placeholder-slate-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm cursor-pointer">Search</button>
            </form>
            {searchError && <div className="text-red-400 text-xs text-center">{searchError}</div>}

            {previewScripture && (
                <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-300 font-bold text-sm">{previewScripture.reference} ({previewScripture.version})</span>
                        <button onClick={() => setPreviewScripture(null)} className="text-slate-400 hover:text-white text-xs px-2">✕</button>
                    </div>
                    <p className="text-slate-300 text-xs italic mb-3 line-clamp-3">"{previewScripture.text}"</p>
                    <button onClick={confirmProjection} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm shadow transition-colors">✔ Confirm & Project</button>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-purple-400 font-semibold flex items-center gap-2">✨ Detected Scriptures</h2>

            <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded border border-slate-600">
                <span className="text-xs text-slate-400">Aa</span>
                <input type="range" min="30" max="120" value={fontSize} onChange={(e) => updateFontSize(parseInt(e.target.value))} className="w-20 accent-purple-500 cursor-pointer" />
            </div>

            <button onClick={clearProjection} className="text-xs bg-slate-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors cursor-pointer">Clear Screen</button>
        </div>

        <div className="flex-1 bg-slate-900 p-6 overflow-y-auto space-y-4">
            {detectedScripture ? (
                <div className="bg-purple-900/20 border border-purple-500/50 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-white">{detectedScripture.reference} <span className="text-sm font-normal text-purple-300">({detectedScripture.version})</span></h3>
                        <button onClick={() => projectScripture(detectedScripture)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">PROJECT 📺</button>
                    </div>
                    <p className="text-purple-200 text-lg leading-relaxed font-serif max-h-40 overflow-y-auto mb-4">"{detectedScripture.text}"</p>
                    {liveScripture && totalSlides > 1 && (
                        <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-600 mt-4">
                            <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition-colors cursor-pointer">⬅ Prev</button>
                            <span className="text-sm font-mono text-purple-300">Slide {currentSlideIndex + 1} / {totalSlides}</span>
                            <button onClick={nextSlide} disabled={currentSlideIndex === totalSlides - 1} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition-colors cursor-pointer">Next ➡</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-slate-600 mt-20">
                    <p>No scriptures detected yet...</p>
                    <p className="text-sm mt-2">Try saying "John Chapter 3 Verse 16"</p>
                </div>
            )}

            {/* HISTORY SECTION WITH NEW BUTTONS */}
            {history.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-slate-500 text-xs uppercase font-bold">Session History</h4>
                        <div className="flex gap-2">
                             {/* EXPORT BUTTON */}
                            <button
                                onClick={exportHistory}
                                className="text-xs bg-blue-900 hover:bg-blue-700 text-blue-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Download Sermon Notes"
                            >
                                ⬇ Export
                            </button>
                             {/* CLEAR BUTTON */}
                            <button
                                onClick={clearHistory}
                                className="text-xs bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-red-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Clear All History"
                            >
                                🗑 Clear
                            </button>
                        </div>
                    </div>

                    {history.slice(1).map((item, idx) => (
                        <div key={idx} className="mb-3 p-3 bg-slate-800/50 rounded flex justify-between items-center group hover:bg-slate-800 transition-colors">
                            <div className="overflow-hidden mr-2">
                                <span className="text-purple-400 font-bold text-sm block">{item.reference} ({item.version})</span>
                                <span className="text-slate-400 text-xs truncate block">{item.text}</span>
                            </div>
                            <button onClick={() => projectScripture(item)} className="opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded transition-all cursor-pointer">Show</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AudioMonitor;