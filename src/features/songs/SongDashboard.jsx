import React, { useState } from 'react';
import useSongLibrary from '../../hooks/useSongLibrary';
import { useProjection } from '../../context/ProjectionContext';
import SongEditorModal from './SongEditorModal';
import ResizableGrid from '../../components/ResizableGrid';
import ResizableVerticalStack from '../../components/ResizableVerticalStack';
import SlideRenderer from '../../components/SlideRenderer';

const SongDashboard = () => {
  // Hooks
  const { songs, agenda, addSong, updateSong, deleteSong, addToAgenda, removeFromAgenda, clearAgenda } = useSongLibrary();

  // Get Projection Data for Live Preview
  const {
      projectSong,
      liveScripture, // This actually holds ANY live content (Song or Scripture)
      theme,
      fontFamily,
      textTransform,
      fontSize,
      layoutMode,
      textAlign,
      aspectRatio,
      clearProjection
  } = useProjection();

  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [activeSong, setActiveSong] = useState(null);

  // Search Logic
  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions
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

  const handleProjectSlide = (index) => {
    if (activeSong) {
        projectSong(activeSong, index);
    }
  };

  // --- COLUMN 1: LIBRARY ---
  const LibraryPanel = (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">🎵 Library</h2>
            <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-3 py-1.5 rounded font-bold transition-colors cursor-pointer">+ New Song</button>
        </div>

        <div className="p-3 bg-slate-950 border-b border-slate-800 shrink-0">
            <input
                type="text"
                placeholder="Search songs..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSongs.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 text-xs">No songs found.</div>
            ) : (
                filteredSongs.map(song => (
                    <div
                        key={song.id}
                        onClick={() => setActiveSong(song)}
                        className={`p-3 rounded border cursor-pointer group transition-colors flex justify-between items-center
                            ${activeSong?.id === song.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'}
                        `}
                    >
                        <div className="min-w-0 flex-1 mr-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-200 text-xs truncate">{song.title}</h3>
                                {song.key && <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">{song.key}</span>}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{song.author}</p>
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
  );

  // --- COLUMN 2: ACTIVE SONG DETAIL ---
  const ActiveSongPanel = (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        {activeSong ? (
            <>
                <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                    <div className="min-w-0">
                        <h2 className="font-bold text-white text-sm truncate">{activeSong.title}</h2>
                        <p className="text-[10px] text-slate-400 truncate">{activeSong.author}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => deleteSong(activeSong.id)} className="text-[10px] bg-red-900/20 hover:bg-red-900 text-red-400 hover:text-white px-3 py-1 rounded transition-colors cursor-pointer">Delete</button>
                        <button onClick={() => handleEdit(activeSong)} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded transition-colors cursor-pointer">✎ Edit</button>
                    </div>
                </div>

                <div className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-4">
                    {getSlides(activeSong.lyrics).map((slide, idx) => (
                        <div key={idx} className="group relative pl-6">
                            <div className="absolute left-0 top-0 text-[10px] text-slate-600 font-mono w-4 text-right">{idx + 1}</div>
                            {/* CLICK TO PROJECT */}
                            <div
                                onClick={() => handleProjectSlide(idx)}
                                className="text-slate-300 text-sm leading-relaxed p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer transition-all whitespace-pre-wrap relative"
                            >
                                {slide}
                                <button
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1 rounded shadow-lg font-bold transition-all"
                                >
                                    PROJECT
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <span className="text-4xl mb-2 opacity-20">🎵</span>
                <p className="text-sm font-bold">No Song Selected</p>
                <p className="text-xs mt-1">Select from Library or Agenda</p>
            </div>
        )}
    </div>
  );

  // --- COLUMN 3 TOP: AGENDA ---
  const AgendaPanel = (
    <div className="flex flex-col h-full bg-slate-900">
        <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-sm font-bold text-green-400 flex items-center gap-2">📅 Agenda</h2>
            {agenda.length > 0 && <button onClick={clearAgenda} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {agenda.length === 0 ? (
                 <div className="text-center text-slate-600 mt-10 text-xs italic">
                    Agenda empty.<br/>Add songs from Library.
                </div>
            ) : (
                agenda.map((item, idx) => (
                    <div
                        key={item.agendaId}
                        onClick={() => setActiveSong(item)}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors group
                             ${activeSong?.id === item.id ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800'}
                        `}
                    >
                        <span className="text-xs font-mono text-slate-500 font-bold w-4">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                            <span className="text-[9px] text-blue-400 bg-blue-900/20 px-1.5 rounded truncate">{item.key || 'No Key'}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFromAgenda(item.agendaId); }}
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                        >×</button>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  // --- COLUMN 3 BOTTOM: PREVIEW ---
  const PreviewPanel = (
    <div className="flex flex-col h-full bg-black relative">
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 animate-pulse">
            ● LIVE PREVIEW
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-black overflow-hidden relative">
            {liveScripture ? (
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

      {/* Modal */}
      <SongEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        songToEdit={editingSong}
      />

      {/* Main Grid */}
      <ResizableGrid
        left={LibraryPanel}
        middle={ActiveSongPanel}
        right={
            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl h-full">
                <ResizableVerticalStack top={AgendaPanel} bottom={PreviewPanel} initialSplit={50} />
            </div>
        }
      />
    </div>
  );
};

export default SongDashboard;