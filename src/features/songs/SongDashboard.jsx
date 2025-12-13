import React, { useState } from 'react';
import useSongLibrary from '../../hooks/useSongLibrary';
import { useProjection } from '../../context/ProjectionContext'; // Import Context
import SongEditorModal from './SongEditorModal';

const SongDashboard = () => {
  const { songs, agenda, addSong, updateSong, deleteSong, addToAgenda, removeFromAgenda, clearAgenda } = useSongLibrary();

  // Connect to Projection Context
  const { projectSong, clearProjection } = useProjection();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [activeSong, setActiveSong] = useState(null);

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (song) => {
    setEditingSong(song);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSong(null);
    setIsModalOpen(true);
  };

  const handleSave = (songData) => {
    if (songData.id) {
        updateSong(songData);
        if (activeSong?.id === songData.id) setActiveSong(songData);
    } else {
        addSong(songData);
    }
  };

  const getSlides = (lyrics) => {
    if (!lyrics) return [];
    return lyrics.split(/\n\n+/).filter(s => s.trim() !== '');
  };

  // Handler for Project Button
  const handleProjectSlide = (index) => {
    if (activeSong) {
        projectSong(activeSong, index);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">

      <SongEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        songToEdit={editingSong}
      />

      {/* LEFT COLUMN: LIBRARY (4 cols) */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2">🎵 Library</h2>
            <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">+ New Song</button>
        </div>

        <div className="p-3 bg-slate-800/50 border-b border-slate-700">
            <input
                type="text"
                placeholder="Search songs..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSongs.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 text-sm">No songs found.</div>
            ) : (
                filteredSongs.map(song => (
                    <div
                        key={song.id}
                        onClick={() => setActiveSong(song)}
                        className={`p-3 rounded-lg cursor-pointer group transition-colors border flex justify-between items-center
                            ${activeSong?.id === song.id ? 'bg-blue-900/30 border-blue-500/50' : 'hover:bg-slate-800 border-transparent hover:border-slate-700'}
                        `}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-200">{song.title}</h3>
                                {song.key && <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 rounded border border-slate-700">{song.key}</span>}
                            </div>
                            <p className="text-xs text-slate-500">{song.author}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); addToAgenda(song); }}
                            className="opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-green-600 text-white text-[10px] px-2 py-1 rounded transition-all"
                            title="Add to Agenda"
                        >
                            + Add
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* MIDDLE: EDITOR / PREVIEW (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {activeSong ? (
            <>
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-white">{activeSong.title}</h2>
                        <p className="text-xs text-slate-400">{activeSong.author}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-px h-6 bg-slate-600 mx-1"></div>
                        <button onClick={() => deleteSong(activeSong.id)} className="text-xs bg-red-900/30 hover:bg-red-900 text-red-400 hover:text-white px-3 py-1 rounded transition-colors cursor-pointer">Delete</button>
                        <button onClick={() => handleEdit(activeSong)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded transition-colors cursor-pointer">✎ Edit</button>
                    </div>
                </div>

                <div className="flex-1 p-6 bg-slate-950 overflow-y-auto space-y-4">
                    {getSlides(activeSong.lyrics).map((slide, idx) => (
                        <div key={idx} className="group relative">
                            <div className="absolute -left-4 top-0 text-[10px] text-slate-600 font-mono">{idx + 1}</div>
                            {/* CLICK TO PROJECT */}
                            <p
                                onClick={() => handleProjectSlide(idx)}
                                className="text-slate-300 leading-relaxed p-4 rounded hover:bg-slate-900 border border-transparent hover:border-blue-500/50 cursor-pointer transition-all whitespace-pre-wrap"
                            >
                                {slide}
                            </p>
                            <button
                                onClick={() => handleProjectSlide(idx)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1 rounded shadow-lg font-bold transition-all"
                            >
                                PROJECT 📺
                            </button>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <span className="text-4xl mb-2">🎵</span>
                <p>Select a song to preview</p>
            </div>
        )}
      </div>

      {/* RIGHT: AGENDA (3 cols) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2">📅 Agenda</h2>
            {agenda.length > 0 && <button onClick={clearAgenda} className="text-[10px] text-red-400 hover:text-red-300">Clear All</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {agenda.length === 0 ? (
                 <div className="text-center text-slate-600 mt-10 text-xs italic">
                    Agenda empty.<br/>Add songs from Library.
                </div>
            ) : (
                agenda.map((item, idx) => (
                    <div
                        key={item.agendaId}
                        onClick={() => setActiveSong(item)}
                        className={`flex items-center gap-3 p-3 rounded border cursor-pointer hover:bg-slate-800 transition-colors group
                             ${activeSong?.id === item.id ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-700'}
                        `}
                    >
                        <span className="text-xs font-mono text-slate-500 font-bold w-4">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{item.title}</h4>
                            <span className="text-[10px] text-blue-400 bg-blue-900/20 px-1.5 rounded truncate">{item.key || 'No Key'}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFromAgenda(item.agendaId); }}
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                    </div>
                ))
            )}
        </div>
      </div>

    </div>
  );
};

export default SongDashboard;