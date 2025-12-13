import React, { useEffect, useRef, useState, useMemo } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useScriptureDetection from '../../hooks/useScriptureDetection';
import { useProjection } from '../../context/ProjectionContext';
import { normalizeSpokenText } from '../../utils/textNormalizer';
import { parseScripture, fetchSecondaryText } from '../../utils/scriptureParser';

import kjvData from '../../data/kjv.json';
import nivData from '../../data/niv.json';
import nkjvData from '../../data/nkjv.json';
import ampData from '../../data/amp.json';
import esvData from '../../data/esv.json';
import nltData from '../../data/nlt.json';
import gwData from '../../data/gw.json';

const AudioMonitor = () => {
  const [version, setVersion] = useState(() => localStorage.getItem('bible_version') || 'KJV');
  const [secondaryVersion, setSecondaryVersion] = useState(() => localStorage.getItem('bible_version_sec') || 'NONE');
  const [manualInput, setManualInput] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [previewScripture, setPreviewScripture] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem('saved_favorites')) || []; } catch (e) { return []; }});

  useEffect(() => { localStorage.setItem('bible_version', version); }, [version]);
  useEffect(() => { localStorage.setItem('bible_version_sec', secondaryVersion); }, [secondaryVersion]);
  useEffect(() => { localStorage.setItem('saved_favorites', JSON.stringify(favorites)); }, [favorites]);

  const BOOK_LIST = useMemo(() => Object.keys(kjvData), []);

  const getBibleData = (v) => {
    switch(v) {
      case 'KJV': return kjvData; case 'NIV': return nivData; case 'NKJV': return nkjvData; case 'AMP': return ampData; case 'ESV': return esvData; case 'NLT': return nltData; case 'GW': return gwData; default: return null;
    }
  };

  const currentBibleData = getBibleData(version);
  const secondaryBibleData = getBibleData(secondaryVersion);

  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, error } = useSpeechRecognition();
  const { detectedScripture: voiceDetected, history, clearHistory, addToHistory } = useScriptureDetection(transcript + ' ' + interimTranscript, currentBibleData, version);
  const [activeScripture, setActiveScripture] = useState(null);

  useEffect(() => { if (voiceDetected) setActiveScripture(voiceDetected); }, [voiceDetected]);

  useEffect(() => {
    if (activeScripture) {
        const updatedResult = parseScripture(activeScripture.reference, currentBibleData, version);
        if (updatedResult) setActiveScripture(updatedResult);
    }
  }, [version, currentBibleData]);

  // Removed layout/style setters from here, only need projection controls
  const { projectScripture, clearProjection, nextSlide, prevSlide, currentSlideIndex, slides, jumpToSlide } = useProjection();

  const bottomRef = useRef(null);
  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [transcript, interimTranscript]);

  const handleInputChange = (e) => {
    const userInput = e.target.value; setManualInput(userInput);
    if (userInput && !/\d+:/.test(userInput) && !/\d\s\d/.test(userInput)) {
        const searchTerm = userInput.toLowerCase();
        const filtered = BOOK_LIST.filter(book => book.toLowerCase().startsWith(searchTerm) || book.toLowerCase().replace(/\s/g, '').startsWith(searchTerm.replace(/\s/g, '')));
        if (filtered.length > 0 && userInput.length > 0) { setSuggestions(filtered); setShowSuggestions(true); setActiveSuggestionIndex(0); } else { setShowSuggestions(false); }
    } else { setShowSuggestions(false); }
  };
  const selectSuggestion = (book) => { setManualInput(`${book} `); setSuggestions([]); setShowSuggestions(false); };

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'text' && showSuggestions) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length); return; }
            if (e.key === 'Enter') { e.preventDefault(); selectSuggestion(suggestions[activeSuggestionIndex]); return; }
            if (e.key === 'Escape') { setShowSuggestions(false); return; }
        }
        if (showHelp && e.key === 'Escape') { setShowHelp(false); return; }
        if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.key !== 'Escape' && e.key !== 'Enter') return;
        switch(e.key) {
            case 'Escape': if (previewScripture) setPreviewScripture(null); else clearProjection(); break;
            case 'ArrowRight': nextSlide(); break;
            case 'ArrowLeft': prevSlide(); break;
            case 'Enter': if (previewScripture && !e.shiftKey) { e.preventDefault(); confirmProjection(); } break;
            case 'p': if (e.altKey && activeScripture) handleProject(activeScripture); break;
            case '?': if (e.shiftKey) setShowHelp(prev => !prev); break;
            default: break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewScripture, activeScripture, nextSlide, prevSlide, clearProjection, showSuggestions, suggestions, activeSuggestionIndex, showHelp]);

  const handleManualSearch = (e) => {
    e.preventDefault(); setSearchError(null); setPreviewScripture(null);
    if (!manualInput.trim()) return;
    const cleanText = normalizeSpokenText(manualInput);
    const result = parseScripture(cleanText, currentBibleData, version);
    if (result) setPreviewScripture(result); else setSearchError(`Scripture not found in ${version}. Check spelling.`);
  };

  const handleProject = (scripture) => {
    let finalScripture = { ...scripture };
    if (secondaryVersion !== 'NONE' && secondaryBibleData) {
        const secData = fetchSecondaryText(scripture, secondaryBibleData);
        if (secData) {
            finalScripture.secondaryText = secData.text;
            finalScripture.secondaryVerseList = secData.verseList;
            finalScripture.secondaryVersion = secondaryVersion;
        }
    }
    projectScripture(finalScripture);
    setActiveScripture(scripture);
    addToHistory(scripture);
    setPreviewScripture(null);
    setManualInput('');
  };

  const confirmProjection = () => { if (previewScripture) handleProject(previewScripture); };

  const exportHistory = () => {
    if (history.length === 0) return; const date = new Date().toLocaleDateString(); let content = `SERMON SCRIPTURE NOTES - ${date}\n\n`;
    [...history].reverse().forEach((item, index) => { content += `${index + 1}. ${item.reference} (${item.version})\n`; content += `"${item.text}"\n\n`; });
    const element = document.createElement("a"); const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file); element.download = `sermon-notes-${Date.now()}.txt`; document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };
  const handlePreviewEdit = (e) => { setPreviewScripture(prev => ({ ...prev, text: e.target.value, verseList: null })); };
  const toggleFavorite = (scripture) => {
    const exists = favorites.find(f => f.reference === scripture.reference && f.version === scripture.version);
    if (exists) setFavorites(prev => prev.filter(f => !(f.reference === scripture.reference && f.version === scripture.version))); else setFavorites(prev => [scripture, ...prev]);
  };
  const isFavorited = (scripture) => { if (!scripture) return false; return favorites.some(f => f.reference === scripture.reference && f.version === scripture.version); };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-8rem)] relative">

      {/* HELP MODAL (Unchanged) */}
      {showHelp && (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-lg w-full shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h3 className="text-xl font-bold text-white">⌨️ Keyboard Shortcuts</h3>
                    <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Enter</span> <span>Search / Project Verse</span></div>
                    <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Esc</span> <span>Clear Screen / Cancel</span></div>
                    <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Alt + P</span> <span>Project Detected Voice Verse</span></div>
                    <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Right Arrow</span> <span>Next Slide/Verse</span></div>
                    <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Left Arrow</span> <span>Previous Slide/Verse</span></div>
                </div>
                <div className="mt-4 text-center"><button onClick={() => setShowHelp(false)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold">Got it!</button></div>
            </div>
        </div>
      )}

      {/* LEFT COLUMN */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        {/* Local Header (Bible Version Only) */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source:</span>
              <select value={version} onChange={(e) => setVersion(e.target.value)} className="bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded border border-slate-600 focus:outline-none focus:border-purple-500">
                <option value="KJV">KJV</option><option value="NIV">NIV</option><option value="NKJV">NKJV</option><option value="AMP">AMP</option><option value="ESV">ESV</option><option value="NLT">NLT</option><option value="GW">GW</option>
              </select>
              <span className="text-xs text-slate-500">+</span>
              <select value={secondaryVersion} onChange={(e) => setSecondaryVersion(e.target.value)} className="bg-slate-900 text-blue-200 text-xs font-bold py-1 px-2 rounded border border-blue-900 focus:outline-none focus:border-blue-500">
                <option value="NONE">None</option><option value="KJV">KJV</option><option value="NIV">NIV</option><option value="NKJV">NKJV</option><option value="AMP">AMP</option><option value="ESV">ESV</option><option value="NLT">NLT</option><option value="GW">GW</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-400">{isListening ? 'LISTENING' : 'OFF AIR'}</span>
            </div>
        </div>

        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed min-h-[150px]">
            {error && <div className="text-red-400 mb-2">{error}</div>} <span className="text-slate-300">{transcript}</span> <span className="text-emerald-400 italic"> {interimTranscript}</span> <div ref={bottomRef} />
        </div>
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col gap-3 shrink-0">
            <div className="flex gap-3">
                <button onClick={isListening ? stopListening : startListening} className={`px-4 py-2 rounded-lg font-medium text-white transition-colors cursor-pointer flex-1 ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{isListening ? 'Stop Mic' : 'Start Mic'}</button>
            </div>
            <div className="relative">
                <form onSubmit={handleManualSearch} className="flex gap-2">
                    <input type="text" value={manualInput} onChange={handleInputChange} placeholder="Type reference (e.g. John 3:16)..." className="flex-1 bg-slate-950 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none placeholder-slate-500" autoComplete="off" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm cursor-pointer">Search</button>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute bottom-full left-0 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl mb-1 max-h-48 overflow-y-auto z-50">
                        {suggestions.map((suggestion, index) => ( <li key={suggestion} onClick={() => selectSuggestion(suggestion)} className={`px-3 py-2 text-sm cursor-pointer ${index === activeSuggestionIndex ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>{suggestion}</li> ))}
                    </ul>
                )}
            </div>
            {searchError && <div className="text-red-400 text-xs text-center">{searchError}</div>}
            {previewScripture && (
                <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-300 font-bold text-sm">{previewScripture.reference} ({previewScripture.version})</span>
                        <div className="flex gap-2 text-[10px] text-slate-400"><span>Edit text below if needed</span></div>
                    </div>
                    <textarea value={previewScripture.text} onChange={handlePreviewEdit} className="w-full bg-slate-800 text-slate-200 text-sm p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none mb-2 font-serif" rows={3} />
                    <div className="flex gap-2">
                        <button onClick={() => setPreviewScripture(null)} className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors cursor-pointer">Cancel</button>
                        <button onClick={confirmProjection} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm shadow transition-colors cursor-pointer">✔ Confirm & Project</button>
                    </div>
                </div>
            )}
            {favorites.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                    <h4 className="text-xs text-slate-400 uppercase font-bold mb-2">⭐ Quick Access / Favorites</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {favorites.map((fav, idx) => (
                            <div key={idx} className="shrink-0 relative group">
                                <button onClick={() => { handleProject(fav); setActiveScripture(fav); addToHistory(fav); }} className="bg-purple-900/40 hover:bg-purple-800 border border-purple-500/30 text-purple-200 text-xs px-3 py-2 rounded-lg flex flex-col items-center min-w-[80px] cursor-pointer">
                                    <span className="font-bold">{fav.reference}</span>
                                    <span className="opacity-50 text-[10px]">{fav.version}</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" title="Remove">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-col gap-3 shrink-0">
            <div className="flex justify-between items-center">
                <h2 className="text-purple-400 font-semibold flex items-center gap-2">✨ Detected Scriptures</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHelp(true)} className="text-slate-400 hover:text-white px-2" title="Keyboard Shortcuts">❓</button>
                    <button onClick={clearProjection} className="text-xs bg-slate-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors cursor-pointer" title="[Esc]">Clear</button>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-slate-900 p-4 overflow-y-auto space-y-4">
            {activeScripture ? (
                <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col">
                    <div className="flex justify-between items-start mb-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{activeScripture.reference} <span className="text-xs font-normal text-purple-300">({activeScripture.version})</span></h3>
                            <button onClick={() => toggleFavorite(activeScripture)} className={`text-lg hover:scale-110 transition-transform ${isFavorited(activeScripture) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-200'}`} title={isFavorited(activeScripture) ? "Remove from Favorites" : "Add to Favorites"}>★</button>
                        </div>
                        <button onClick={() => handleProject(activeScripture)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer text-sm" title="[Alt + P]">PROJECT 📺</button>
                    </div>
                    <p className="text-purple-200 text-base leading-relaxed font-serif mb-3 overflow-y-auto max-h-32 border-b border-purple-500/30 pb-3">"{activeScripture.text}"</p>
                    {slides.length > 1 && (
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-1 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-1">Jump to Verse</h4>
                            {slides.map((slide, index) => (
                                <button key={index} onClick={() => jumpToSlide(index)} className={`w-full text-left px-3 py-2 rounded border transition-all duration-200 flex gap-2 group ${currentSlideIndex === index ? 'bg-purple-600 border-purple-400 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}`}>
                                    <span className={`font-bold font-mono text-xs ${currentSlideIndex === index ? 'text-purple-200' : 'text-slate-500'}`}>{slide.reference.split(':')[1] || index + 1}</span>
                                    <span className="text-xs line-clamp-1 leading-snug">{slide.text}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-slate-600 mt-20"><p>No scriptures detected yet...</p><p className="text-sm mt-2">Try saying "John Chapter 3 Verse 16"</p></div>
            )}

            {history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-slate-500 text-xs uppercase font-bold">Session History</h4>
                        <div className="flex gap-2"><button onClick={exportHistory} className="text-xs bg-blue-900 hover:bg-blue-700 text-blue-200 px-2 py-1 rounded transition-colors cursor-pointer">⬇ Export</button><button onClick={clearHistory} className="text-xs bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-red-200 px-2 py-1 rounded transition-colors cursor-pointer">🗑 Clear</button></div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {history.slice(1).map((item, idx) => (
                            <div key={idx} className="mb-2 p-2 bg-slate-800/50 rounded flex justify-between items-center group hover:bg-slate-800 transition-colors">
                                <div className="overflow-hidden mr-2"><span className="text-purple-400 font-bold text-xs block">{item.reference} ({item.version})</span><span className="text-slate-400 text-[10px] truncate block">{item.text}</span></div>
                                <button onClick={() => { handleProject(item); setActiveScripture(item); }} className="opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-purple-600 text-white text-[10px] px-2 py-1 rounded transition-all cursor-pointer">Show</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AudioMonitor;