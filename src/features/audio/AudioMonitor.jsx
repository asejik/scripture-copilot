import React, { useEffect, useRef } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useScriptureDetection from '../../hooks/useScriptureDetection';

const AudioMonitor = () => {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition();

  // Feed the transcript into our new detection hook
  const { detectedScripture, history } = useScriptureDetection(transcript + ' ' + interimTranscript);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimTranscript]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">

      {/* LEFT: Audio Feed */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">🎙️ Live Audio</h2>
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-400">{isListening ? 'LISTENING' : 'OFFLINE'}</span>
            </div>
        </div>

        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed">
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <span className="text-slate-300">{transcript}</span>
            <span className="text-emerald-400 italic"> {interimTranscript}</span>
            <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
            <button onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {isListening ? 'Stop' : 'Start'}
            </button>
            <button onClick={resetTranscript} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600">
                Clear
            </button>
        </div>
      </div>

      {/* RIGHT: Detection Results */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
            <h2 className="text-purple-400 font-semibold flex items-center gap-2">✨ Detected Scriptures</h2>
        </div>

        <div className="flex-1 bg-slate-900 p-6 overflow-y-auto space-y-4">
            {/* Main Result */}
            {detectedScripture ? (
                <div className="bg-purple-900/20 border border-purple-500/50 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-bold text-white mb-2">{detectedScripture.reference}</h3>
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
                        <div key={idx} className="mb-3 p-3 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                            <span className="text-purple-400 font-bold text-sm block">{item.reference}</span>
                            <span className="text-slate-400 text-xs truncate block">{item.text}</span>
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