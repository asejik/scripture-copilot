import { useState, useEffect } from 'react';

const useSongLibrary = () => {
  // --- SONGS ---
  const [songs, setSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_songs')) || []; } catch (e) { return []; }
  });

  const [agenda, setAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_agenda')) || []; } catch (e) { return []; }
  });

  // --- SCRIPTURES (NEW) ---
  const [scriptureAgenda, setScriptureAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_scripture_agenda')) || []; } catch (e) { return []; }
  });

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('copilot_songs', JSON.stringify(songs)); }, [songs]);
  useEffect(() => { localStorage.setItem('copilot_agenda', JSON.stringify(agenda)); }, [agenda]);
  useEffect(() => { localStorage.setItem('copilot_scripture_agenda', JSON.stringify(scriptureAgenda)); }, [scriptureAgenda]);

  // --- SONG ACTIONS ---
  const addSong = (song) => { setSongs(prev => [{ ...song, id: Date.now().toString() }, ...prev]); };
  const updateSong = (updated) => { setSongs(prev => prev.map(s => s.id === updated.id ? updated : s)); };
  const deleteSong = (id) => { if(confirm('Delete song?')) { setSongs(prev => prev.filter(s => s.id !== id)); setAgenda(prev => prev.filter(i => i.songId !== id)); } };

  const addToAgenda = (song) => { setAgenda(prev => [...prev, { ...song, agendaId: Date.now().toString(), songId: song.id }]); };
  const removeFromAgenda = (id) => { setAgenda(prev => prev.filter(i => i.agendaId !== id)); };
  const clearAgenda = () => { if(confirm('Clear song agenda?')) setAgenda([]); };

  // --- SCRIPTURE ACTIONS (NEW) ---
  const addToScriptureAgenda = (scripture) => {
    // Avoid duplicates if needed, but allowing for now
    setScriptureAgenda(prev => [...prev, { ...scripture, agendaId: Date.now().toString() }]);
  };

  const removeFromScriptureAgenda = (id) => {
    setScriptureAgenda(prev => prev.filter(i => i.agendaId !== id));
  };

  const clearScriptureAgenda = () => {
    if(confirm('Clear scripture agenda?')) setScriptureAgenda([]);
  };

  return {
    songs, agenda, addSong, updateSong, deleteSong, addToAgenda, removeFromAgenda, clearAgenda,
    scriptureAgenda, addToScriptureAgenda, removeFromScriptureAgenda, clearScriptureAgenda
  };
};

export default useSongLibrary;