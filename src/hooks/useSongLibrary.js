import { useState, useEffect } from 'react';

const useSongLibrary = () => {
  // Load Songs from LocalStorage
  const [songs, setSongs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('copilot_songs')) || [];
    } catch (e) {
      return [];
    }
  });

  // Load Agenda from LocalStorage
  const [agenda, setAgenda] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('copilot_agenda')) || [];
    } catch (e) {
      return [];
    }
  });

  // Auto-save whenever they change
  useEffect(() => {
    localStorage.setItem('copilot_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('copilot_agenda', JSON.stringify(agenda));
  }, [agenda]);

  // --- ACTIONS ---

  const addSong = (song) => {
    const newSong = { ...song, id: Date.now().toString() };
    setSongs(prev => [newSong, ...prev]);
  };

  const updateSong = (updatedSong) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
  };

  const deleteSong = (id) => {
    if (confirm('Are you sure you want to delete this song?')) {
      setSongs(prev => prev.filter(s => s.id !== id));
      // Also remove from agenda if it exists there
      setAgenda(prev => prev.filter(item => item.songId !== id));
    }
  };

  const addToAgenda = (song) => {
    // Prevent duplicates in agenda? (Optional, currently allowing duplicates)
    setAgenda(prev => [...prev, { ...song, agendaId: Date.now().toString(), songId: song.id }]);
  };

  const removeFromAgenda = (agendaId) => {
    setAgenda(prev => prev.filter(item => item.agendaId !== agendaId));
  };

  const clearAgenda = () => {
      if(confirm('Clear the entire agenda?')) setAgenda([]);
  }

  // Drag and Drop reordering (Simple version)
  const moveAgendaItem = (fromIndex, toIndex) => {
    const updated = [...agenda];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setAgenda(updated);
  };

  return {
    songs,
    agenda,
    addSong,
    updateSong,
    deleteSong,
    addToAgenda,
    removeFromAgenda,
    clearAgenda,
    moveAgendaItem
  };
};

export default useSongLibrary;