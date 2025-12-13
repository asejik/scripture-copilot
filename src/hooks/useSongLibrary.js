import { useState, useEffect } from 'react';

const useSongLibrary = () => {
  // --- SONGS ---
  const [songs, setSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_songs')) || []; } catch (e) { return []; }
  });

  const [agenda, setAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_agenda')) || []; } catch (e) { return []; }
  });

  // --- SCRIPTURE AGENDA ---
  const [scriptureAgenda, setScriptureAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_scripture_agenda')) || []; } catch (e) { return []; }
  });

  // --- SESSION STATE (NEW: PERSISTENCE FOR TABS) ---
  // We don't necessarily need to save this to localStorage (optional),
  // but keeping it in state here ensures it survives Tab Switching.
  const [sessionHistory, setSessionHistory] = useState([]);
  const [activeDetection, setActiveDetection] = useState(null);

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('copilot_songs', JSON.stringify(songs)); }, [songs]);
  useEffect(() => { localStorage.setItem('copilot_agenda', JSON.stringify(agenda)); }, [agenda]);
  useEffect(() => { localStorage.setItem('copilot_scripture_agenda', JSON.stringify(scriptureAgenda)); }, [scriptureAgenda]);

  // --- ACTIONS ---
  const addSong = (song) => { setSongs(prev => [{ ...song, id: Date.now().toString() }, ...prev]); };
  const updateSong = (updated) => { setSongs(prev => prev.map(s => s.id === updated.id ? updated : s)); };
  const deleteSong = (id) => { if(confirm('Delete song?')) { setSongs(prev => prev.filter(s => s.id !== id)); setAgenda(prev => prev.filter(i => i.songId !== id)); } };

  const addToAgenda = (song) => { setAgenda(prev => [...prev, { ...song, agendaId: Date.now().toString(), songId: song.id }]); };
  const removeFromAgenda = (id) => { setAgenda(prev => prev.filter(i => i.agendaId !== id)); };
  const clearAgenda = () => { if(confirm('Clear song agenda?')) setAgenda([]); };

  const addToScriptureAgenda = (scripture) => { setScriptureAgenda(prev => [...prev, { ...scripture, agendaId: Date.now().toString() }]); };
  const removeFromScriptureAgenda = (id) => { setScriptureAgenda(prev => prev.filter(i => i.agendaId !== id)); };
  const clearScriptureAgenda = () => { if(confirm('Clear scripture agenda?')) setScriptureAgenda([]); };

  // Session Actions
  const addToHistory = (item) => {
      setSessionHistory(prev => {
          // Prevent duplicates at the top
          if (prev.length > 0 && prev[0].reference === item.reference && prev[0].version === item.version) return prev;
          return [item, ...prev].slice(0, 50);
      });
  };
  const clearHistory = () => setSessionHistory([]);
  const updateActiveDetection = (item) => setActiveDetection(item);

  return {
    songs, agenda, addSong, updateSong, deleteSong, addToAgenda, removeFromAgenda, clearAgenda,
    scriptureAgenda, addToScriptureAgenda, removeFromScriptureAgenda, clearScriptureAgenda,
    // Exports for Session Persistence
    sessionHistory, activeDetection, addToHistory, clearHistory, updateActiveDetection
  };
};

export default useSongLibrary;