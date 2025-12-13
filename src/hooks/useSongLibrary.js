import { useState, useEffect } from 'react';

const useSongLibrary = () => {
  // --- SONGS & AGENDA (Existing) ---
  const [songs, setSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_songs')) || []; } catch (e) { return []; }
  });

  const [agenda, setAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_agenda')) || []; } catch (e) { return []; }
  });

  const [scriptureAgenda, setScriptureAgenda] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_scripture_agenda')) || []; } catch (e) { return []; }
  });

  // --- SESSION STATE (FIXED: NOW PERSISTENT) ---
  // We now load this from localStorage so it survives tab switching
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_session_history')) || []; } catch (e) { return []; }
  });

  const [activeDetection, setActiveDetection] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_active_detection')) || null; } catch (e) { return null; }
  });

  // --- SAVE TO DISK ---
  useEffect(() => { localStorage.setItem('copilot_songs', JSON.stringify(songs)); }, [songs]);
  useEffect(() => { localStorage.setItem('copilot_agenda', JSON.stringify(agenda)); }, [agenda]);
  useEffect(() => { localStorage.setItem('copilot_scripture_agenda', JSON.stringify(scriptureAgenda)); }, [scriptureAgenda]);

  // Save Session Data
  useEffect(() => { localStorage.setItem('copilot_session_history', JSON.stringify(sessionHistory)); }, [sessionHistory]);
  useEffect(() => { localStorage.setItem('copilot_active_detection', JSON.stringify(activeDetection)); }, [activeDetection]);

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

  const addToHistory = (item) => {
      setSessionHistory(prev => {
          if (prev.length > 0 && prev[0].reference === item.reference && prev[0].version === item.version) return prev;
          return [item, ...prev].slice(0, 50);
      });
  };
  const clearHistory = () => {
      if(confirm('Clear session history?')) setSessionHistory([]);
  };
  const updateActiveDetection = (item) => setActiveDetection(item);

  return {
    songs, agenda, addSong, updateSong, deleteSong, addToAgenda, removeFromAgenda, clearAgenda,
    scriptureAgenda, addToScriptureAgenda, removeFromScriptureAgenda, clearScriptureAgenda,
    sessionHistory, activeDetection, addToHistory, clearHistory, updateActiveDetection
  };
};

export default useSongLibrary;