import React, { useState } from 'react';

const SongDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Mock Data for UI visualization
  const [songs] = useState([
    { id: 1, title: "Way Maker", author: "Sinach", key: "E" },
    { id: 2, title: "Goodness of God", author: "Bethel Music", key: "G" },
    { id: 3, title: "10,000 Reasons", author: "Matt Redman", key: "D" },
  ]);
  const [agenda] = useState([
    { id: 1, title: "Way Maker", type: "Worship" },
    { id: 2, title: "Goodness of God", type: "Worship" }
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">

      {/* LEFT COLUMN: LIBRARY (4 cols) */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2">🎵 Library</h2>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">+ New Song</button>
        </div>

        {/* Search */}
        <div className="p-3 bg-slate-800/50 border-b border-slate-700">
            <input
                type="text"
                placeholder="Search songs..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {songs.map(song => (
                <div key={song.id} className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-slate-700">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-200">{song.title}</h3>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 rounded border border-slate-700">{song.key}</span>
                    </div>
                    <p className="text-xs text-slate-500">{song.author}</p>
                </div>
            ))}
        </div>
      </div>

      {/* MIDDLE: EDITOR / PREVIEW (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-white">Way Maker</h2>
                <p className="text-xs text-slate-400">Verse 1 • Chorus • Bridge</p>
            </div>
            <button className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded transition-colors cursor-pointer">✎ Edit</button>
        </div>

        {/* Lyrics Preview */}
        <div className="flex-1 p-6 bg-slate-950 overflow-y-auto space-y-6">
            {/* Mock Verse */}
            <div className="group">
                <h4 className="text-[10px] uppercase font-bold text-blue-400 mb-1">Verse 1</h4>
                <p className="text-slate-300 leading-relaxed p-3 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all">
                    You are here, moving in our midst<br/>
                    I worship You, I worship You<br/>
                    You are here, working in this place<br/>
                    I worship You, I worship You
                </p>
            </div>

            <div className="group">
                <h4 className="text-[10px] uppercase font-bold text-purple-400 mb-1">Chorus</h4>
                <p className="text-white text-lg font-medium leading-relaxed p-3 rounded bg-slate-900 border border-purple-900/30 cursor-pointer shadow-lg">
                    Way maker, miracle worker, promise keeper<br/>
                    Light in the darkness<br/>
                    My God, that is who You are
                </p>
            </div>
        </div>
      </div>

      {/* RIGHT: AGENDA (3 cols) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
            <h2 className="font-bold text-white flex items-center gap-2">📅 Agenda</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {agenda.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-xs font-mono text-slate-500 font-bold w-4">{idx + 1}</span>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                        <span className="text-[10px] text-blue-400 bg-blue-900/20 px-1.5 rounded">{item.type}</span>
                    </div>
                    <button className="text-slate-500 hover:text-red-400">×</button>
                </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-500 rounded hover:border-slate-500 hover:text-slate-300 text-sm font-bold transition-all">
                + Drag Songs Here
            </button>
        </div>
      </div>

    </div>
  );
};

export default SongDashboard;