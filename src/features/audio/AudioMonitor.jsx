import React, { useEffect, useRef, useState, useMemo } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useScriptureDetection from '../../hooks/useScriptureDetection';
import { useProjection } from '../../context/ProjectionContext';
import { normalizeSpokenText } from '../../utils/textNormalizer';
import { parseScripture, fetchSecondaryText } from '../../utils/scriptureParser';
import useSongLibrary from '../../hooks/useSongLibrary';
import ResizableGrid from '../../components/ResizableGrid';
import ResizableVerticalStack from '../../components/ResizableVerticalStack';
import SlideRenderer from '../../components/SlideRenderer';

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

  // Use Global Store for Persistence
  const {
      scriptureAgenda, addToScriptureAgenda, removeFromScriptureAgenda, clearScriptureAgenda,
      sessionHistory, activeDetection, addToHistory, clearHistory, updateActiveDetection
  } = useSongLibrary();

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
  const { detectedScripture: voiceDetected } = useScriptureDetection(transcript + ' ' + interimTranscript, currentBibleData, version);

  // --- FIX PERSISTENCE: Initialize local state from Global Store ---
  const [activeScripture, setActiveScripture] = useState(activeDetection || null);

  // Sync Voice -> Active Card (Global Store)
  useEffect(() => {
      if (voiceDetected) {
          updateActiveDetection(voiceDetected);
          setActiveScripture(voiceDetected); // Update local state immediately
          addToHistory(voiceDetected);
      }
  }, [voiceDetected]);

  // Sync Manual/Click updates back to Global Store
  useEffect(() => {
      if (activeScripture) {
          updateActiveDetection(activeScripture);
      }
  }, [activeScripture]);

  const { projectScripture, projectSong, liveScripture, nextSlide, prevSlide, currentSlideIndex, slides, jumpToSlide, theme, fontFamily, textTransform, fontSize, layoutMode, textAlign, aspectRatio } = useProjection();

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
  }, [previewScripture, activeScripture, nextSlide, prevSlide, showSuggestions, suggestions, activeSuggestionIndex, showHelp]);

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

  const handleAddToAgenda = (scripture) => {
      addToScriptureAgenda(scripture);
      setPreviewScripture(null);
      setManualInput('');
  }

  const exportHistory = () => {
    if (sessionHistory.length === 0) return; const date = new Date().toLocaleDateString(); let content = `SERMON SCRIPTURE NOTES - ${date}\n\n`;
    [...sessionHistory].reverse().forEach((item, index) => { content += `${index + 1}. ${item.reference} (${item.version})\n`; content += `"${item.text}"\n\n`; });
    const element = document.createElement("a"); const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file); element.download = `sermon-notes-${Date.now()}.txt`; document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };
  const handlePreviewEdit = (e) => { setPreviewScripture(prev => ({ ...prev, text: e.target.value, verseList: null })); };
  const toggleFavorite = (scripture) => {
    const exists = favorites.find(f => f.reference === scripture.reference && f.version === scripture.version);
    if (exists) setFavorites(prev => prev.filter(f => !(f.reference === scripture.reference && f.version === scripture.version))); else setFavorites(prev => [scripture, ...prev]);
  };
  const isFavorited = (scripture) => { if (!scripture) return false; return favorites.some(f => f.reference === scripture.reference && f.version === scripture.version); };

  // --- COLUMN CONTENT BLOCKS ---

  // 1. TOP LEFT: AUDIO INPUT
  const LiveAudioPanel = (
    <div className="flex flex-col h-full bg-slate-950 relative">
        {/* FIX LABEL LOCATION */}
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 animate-pulse">
            ● LIVE TRANSCRIPT
        </div>

        <div className="bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-400">INPUT SOURCE</span>
            <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        </div>
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-slate-400">
            {error && <div className="text-red-400 mb-2 font-bold">{error}</div>}
            <span>{transcript}</span> <span className="text-emerald-400 italic"> {interimTranscript}</span> <div ref={bottomRef} />
        </div>
    </div>
  );

  // 2. BOTTOM LEFT: SEARCH & CONTROLS
  const SearchPanel = (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700">
        <div className="p-3 flex flex-col gap-2 h-full">
            <div className="flex gap-2">
                <button onClick={isListening ? stopListening : startListening} className={`flex-1 px-3 py-2 rounded font-bold text-xs text-white ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{isListening ? 'STOP MIC' : 'START MIC'}</button>
                <button onClick={resetTranscript} className="px-3 py-2 bg-slate-700 text-slate-300 text-xs rounded hover:bg-slate-600 font-bold">CLEAR</button>
            </div>
            <div className="relative">
                <form onSubmit={handleManualSearch} className="flex gap-1">
                    <input type="text" value={manualInput} onChange={handleInputChange} placeholder="Type ref (e.g. jn 3 16)..." className="flex-1 bg-slate-950 text-white border border-slate-600 rounded px-2 py-3 text-sm focus:border-purple-500 focus:outline-none placeholder-slate-600" autoComplete="off" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm">GO</button>
                </form>
                {showSuggestions && suggestions.length > 0 && <ul className="absolute bottom-full left-0 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl mb-1 max-h-40 overflow-y-auto z-50">{suggestions.map((suggestion, index) => ( <li key={suggestion} onClick={() => selectSuggestion(suggestion)} className={`px-3 py-2 text-xs cursor-pointer ${index === activeSuggestionIndex ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>{suggestion}</li> ))}</ul>}
            </div>
            {searchError && <div className="text-red-400 text-[10px] text-center">{searchError}</div>}

            <div className="flex items-center gap-1">
              <select value={version} onChange={(e) => setVersion(e.target.value)} className="flex-1 bg-slate-950 text-white text-[10px] font-bold py-1 px-2 rounded border border-slate-600">
                <option value="KJV">KJV</option><option value="NIV">NIV</option><option value="NKJV">NKJV</option><option value="AMP">AMP</option><option value="ESV">ESV</option><option value="NLT">NLT</option><option value="GW">GW</option>
              </select>
              <span className="text-[10px] text-slate-500">+</span>
              <select value={secondaryVersion} onChange={(e) => setSecondaryVersion(e.target.value)} className="flex-1 bg-slate-950 text-blue-200 text-[10px] font-bold py-1 px-2 rounded border border-blue-900">
                <option value="NONE">None</option><option value="KJV">KJV</option><option value="NIV">NIV</option><option value="NKJV">NKJV</option><option value="AMP">AMP</option><option value="ESV">ESV</option><option value="NLT">NLT</option><option value="GW">GW</option>
              </select>
            </div>

            {previewScripture && (
              <div className="mt-1 bg-slate-700/50 border border-blue-500/50 rounded p-2 animate-in fade-in slide-in-from-bottom-2 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-300 font-bold text-xs">{previewScripture.reference}</span>
                      <button onClick={() => setPreviewScripture(null)} className="text-[10px] text-slate-400 hover:text-white">✕</button>
                  </div>
                  <textarea value={previewScripture.text} onChange={handlePreviewEdit} className="w-full bg-slate-800 text-slate-200 text-xs p-1 rounded border border-slate-600 focus:border-blue-500 mb-2 font-serif flex-1 resize-none" />
                  <div className="flex gap-2">
                      <button onClick={() => handleAddToAgenda(previewScripture)} className="px-3 bg-slate-600 hover:bg-slate-500 text-white py-1.5 rounded font-bold text-xs">+ Agenda</button>
                      <button onClick={confirmProjection} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded font-bold text-xs shadow">PROJECT NOW</button>
                  </div>
              </div>
            )}

            {/* RESTORED FAVORITES BAR */}
            {favorites.length > 0 && (
                <div className="pt-2 border-t border-slate-700 mt-auto">
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {favorites.map((fav, idx) => (
                            <button key={idx} onClick={() => { handleProject(fav); setActiveScripture(fav); addToHistory(fav); }} className="bg-purple-900/40 hover:bg-purple-800 border border-purple-500/30 text-purple-200 text-[10px] px-2 py-1 rounded min-w-[60px] whitespace-nowrap">
                                <span className="font-bold block">{fav.reference}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  // 3. MIDDLE COLUMN: DETECTED & ACTIVE
  const middleColumn = (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-bold text-purple-400 flex items-center gap-2">✨ Detected & Active</h2>
            <button onClick={() => setShowHelp(true)} className="text-slate-500 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">Shortcuts ?</button>
        </div>

        <div className="flex-1 bg-slate-900 p-4 overflow-y-auto space-y-4">
            {activeScripture ? (
                <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative flex flex-col">
                    <div className="flex justify-between items-start mb-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{activeScripture.reference} <span className="text-xs font-normal text-purple-300">({activeScripture.version})</span></h3>
                            <button onClick={() => toggleFavorite(activeScripture)} className={`text-lg hover:scale-110 transition-transform ${isFavorited(activeScripture) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-200'}`} title="Favorite">★</button>
                        </div>
                        <button onClick={() => handleProject(activeScripture)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer text-xs uppercase tracking-widest">PROJECT</button>
                    </div>
                    <p className="text-purple-100 text-lg leading-relaxed font-serif mb-3 max-h-60 overflow-y-auto border-b border-purple-500/30 pb-3">"{activeScripture.text}"</p>
                    {slides.length > 1 && (
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 custom-scrollbar max-h-40">
                            <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-1 sticky top-0 bg-purple-900/20 backdrop-blur-sm p-1">Verse Selection</h4>
                            {slides.map((slide, index) => (
                                <button key={index} onClick={() => jumpToSlide(index)} className={`w-full text-left px-3 py-2 rounded border transition-all duration-200 flex gap-2 group items-center ${currentSlideIndex === index ? 'bg-purple-600 border-purple-400 text-white shadow' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'}`}>
                                    <span className={`font-bold font-mono text-xs w-6 text-center ${currentSlideIndex === index ? 'text-purple-200' : 'text-slate-500'}`}>{slide.reference.split(':')[1] || index + 1}</span>
                                    <span className="text-xs line-clamp-1 leading-snug flex-1">{slide.text}</span>
                                    {currentSlideIndex === index && <span className="text-[8px] uppercase tracking-wider font-bold bg-white/20 px-1 rounded">Live</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-slate-600 mt-20 flex flex-col items-center">
                    <div className="text-4xl mb-2 opacity-20">📖</div>
                    <p className="font-bold">Ready to Detect</p>
                    <p className="text-xs mt-1">Spoken scriptures will appear here.</p>
                </div>
            )}

            {sessionHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-slate-500 text-xs uppercase font-bold tracking-wider">History</h4>
                        <div className="flex gap-2">
                            <button onClick={exportHistory} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">Export</button>
                            <button onClick={clearHistory} className="text-[10px] bg-slate-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 px-2 py-1 rounded">Clear</button>
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {sessionHistory.slice(1).map((item, idx) => (
                            <div key={idx} className="p-2 bg-slate-800/30 border border-slate-800 rounded flex justify-between items-center group hover:bg-slate-800 transition-colors">
                                <div className="overflow-hidden mr-2"><span className="text-slate-300 font-bold text-xs block">{item.reference}</span><span className="text-slate-500 text-[10px] truncate block">{item.text}</span></div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => addToScriptureAgenda(item)} className="bg-slate-700 hover:bg-slate-600 text-white text-[10px] px-2 py-1 rounded" title="Add to Agenda">+</button>
                                    <button onClick={() => { handleProject(item); setActiveScripture(item); }} className="bg-purple-700 hover:bg-purple-600 text-white text-[10px] px-2 py-1 rounded">Show</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  // 4. TOP RIGHT: AGENDA
  const AgendaPanel = (
    <div className="flex flex-col h-full bg-slate-900">
        <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-sm font-bold text-green-400 flex items-center gap-2">📅 Agenda</h2>
            {scriptureAgenda.length > 0 && <button onClick={clearScriptureAgenda} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {scriptureAgenda.length === 0 ? (
                <div className="text-center text-slate-600 mt-10 text-xs italic">Agenda empty.</div>
            ) : (
                scriptureAgenda.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/30 border border-slate-700 rounded group hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => { handleProject(item); setActiveScripture(item); }}>
                        <span className="text-xs font-mono text-slate-500 font-bold w-4">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{item.reference}</h4>
                            <span className="text-[10px] text-slate-500 truncate">{item.version}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeFromScriptureAgenda(item.agendaId); }} className="text-slate-500 hover:text-red-400 px-2">×</button>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  // 5. BOTTOM RIGHT: LIVE PREVIEW
  const PreviewPanel = (
    <div className="flex flex-col h-full bg-black relative">
        {/* FIX LABEL LOCATION */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 animate-pulse">
            ● LIVE PREVIEW
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-black overflow-hidden relative">
            {liveScripture ? (
                // SCALING CONTAINER: FIX ASPECT RATIO MATHEMATICALLY
                <div style={{ width: '100%', aspectRatio: aspectRatio === '12:5' ? '2.4/1' : '16/9' }}>
                    <SlideRenderer
                        content={liveScripture}
                        theme={theme}
                        fontSize={fontSize}
                        layoutMode={layoutMode}
                        textAlign={textAlign}
                        aspectRatio={aspectRatio}
                        fontFamily={fontFamily}
                        textTransform={textTransform}
                        isPreview={true}
                    />
                </div>
            ) : (
                <div className="text-white/20 font-mono text-xs text-center">[ WAITING ]</div>
            )}
        </div>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-6rem)] relative">
        {/* HELP MODAL */}
        {showHelp && (
            <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-lg w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h3 className="text-xl font-bold text-white">⌨️ Keyboard Shortcuts</h3>
                        <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Enter</span> <span>Search / Project Verse</span></div>
                        <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Alt + P</span> <span>Project Detected Voice Verse</span></div>
                        <div className="flex justify-between bg-slate-700/50 p-2 rounded"><span className="font-bold text-white">Right/Left Arrow</span> <span>Next/Prev Slide</span></div>
                    </div>
                    <div className="mt-4 text-center"><button onClick={() => setShowHelp(false)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold">Got it!</button></div>
                </div>
            </div>
        )}

        <ResizableGrid
            left={
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl h-full">
                    <ResizableVerticalStack top={LiveAudioPanel} bottom={SearchPanel} initialSplit={40} />
                </div>
            }
            middle={middleColumn}
            right={
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl h-full">
                    <ResizableVerticalStack top={AgendaPanel} bottom={PreviewPanel} initialSplit={50} />
                </div>
            }
        />
    </div>
  );
};

export default AudioMonitor;