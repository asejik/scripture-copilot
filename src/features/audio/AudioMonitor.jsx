import React, { useEffect, useRef } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useScriptureDetection from '../../hooks/useScriptureDetection';
import { useProjection } from '../../context/ProjectionContext';

const AudioMonitor = () => {
  // 1. Audio Listener Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition();

  // 2. Logic Hook (Detects verses in the text)
  // We combine confirmed text + current spoken text for detection
  const { detectedScripture, history } = useScriptureDetection(transcript + ' ' + interimTranscript);

  // 3. Projection Hook (Sends data to OBS overlay)
  const { projectScripture, clearProjection } = useProjection();

  // Auto-scroll ref
  const bottomRef = useRef(null);

  // Effect: Auto-scroll to bottom of transcript
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimTranscript]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">

      {/* LEFT COLUMN: Audio Feed */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">🎙️ Live Audio</h2>
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-400">{isListening ? 'LISTENING' : 'OFFLINE'}</span>
            </div>
        </div>

        {/* Transcript Text Area */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed">
            {error && <div className="text-red-400 mb-2">{error}</div>}

            <span className="text-slate-300">{transcript}</span>
            <span className="text-emerald-400 italic"> {interimTranscript}</span>

            {/* Scroll Anchor */}
            <div ref={bottomRef} />
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
            <button
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors cursor-pointer ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {isListening ? 'Stop' : 'Start'}
            </button>
            <button
                onClick={resetTranscript}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 cursor-pointer">
                Clear Text
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Detection Results */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-purple-400 font-semibold flex items-center gap-2">✨ Detected Scriptures</h2>
            <button
                onClick={clearProjection}
                className="text-xs bg-slate-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors cursor-pointer">
                Clear Screen
            </button>
        </div>

        <div className="flex-1 bg-slate-900 p-6 overflow-y-auto space-y-4">
            {/* Active Suggestion Card */}
            {detectedScripture ? (
                <div className="bg-purple-900/20 border border-purple-500/50 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-white">{detectedScripture.reference}</h3>
                        <button
                            onClick={() => projectScripture(detectedScripture)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                            PROJECT 📺
                        </button>
                    </div>
                    <p className="text-purple-200 text-lg leading-relaxed font-serif">"{detectedScripture.text}"</p>
                </div>
            ) : (
                <div className="text-center text-slate-600 mt-20">
                    <p>No scriptures detected yet...</p>
                    <p className="text-sm mt-2">Try saying "John Chapter 3 Verse 16"</p>
                </div>
            )}

            {/* History List */}
            {history.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-800">
                    <h4 className="text-slate-500 text-xs uppercase font-bold mb-3">Previous Detections</h4>
                    {history.slice(1).map((item, idx) => (
                        <div key={idx} className="mb-3 p-3 bg-slate-800/50 rounded flex justify-between items-center group hover:bg-slate-800 transition-colors">
                            <div className="overflow-hidden mr-2">
                                <span className="text-purple-400 font-bold text-sm block">{item.reference}</span>
                                <span className="text-slate-400 text-xs truncate block">{item.text}</span>
                            </div>
                            <button
                                onClick={() => projectScripture(item)}
                                className="opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded transition-all cursor-pointer">
                                Show
                            </button>
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