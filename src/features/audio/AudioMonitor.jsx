import React, { useEffect, useRef } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

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

  const bottomRef = useRef(null);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimTranscript]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
        <h2 className="text-slate-200 font-semibold text-lg flex items-center gap-2">
          🎙️ Live Audio Feed
        </h2>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-sm text-slate-400 font-mono uppercase">
            {isListening ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="h-64 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed">
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-400 border border-red-800 rounded">
            {error}
          </div>
        )}

        {transcript === '' && interimTranscript === '' && !error && (
            <p className="text-slate-600 italic">Waiting for audio input...</p>
        )}

        <span className="text-slate-300">{transcript}</span>
        <span className="text-emerald-400 italic">{interimTranscript}</span>
        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
        {!isListening ? (
          <button
            onClick={startListening}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Stop Listening
          </button>
        )}

        <button
          onClick={resetTranscript}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer ml-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default AudioMonitor;