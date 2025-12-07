import React, { createContext, useState, useEffect, useContext } from 'react';

const ProjectionContext = createContext();

export const ProjectionProvider = ({ children }) => {
  // 1. Initialize state from LocalStorage if available
  const [liveScripture, setLiveScripture] = useState(() => {
    const saved = localStorage.getItem('current_scripture');
    return saved ? JSON.parse(saved) : null;
  });

  const channelName = 'scripture_copilot';

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);

    // Listen for messages from other tabs
    channel.onmessage = (event) => {
      console.log("Received Broadcast:", event.data); // Debug log

      if (event.data.type === 'SHOW_SCRIPTURE') {
        setLiveScripture(event.data.payload);
        // Sync to local storage for persistence
        localStorage.setItem('current_scripture', JSON.stringify(event.data.payload));
      } else if (event.data.type === 'CLEAR_SCREEN') {
        setLiveScripture(null);
        localStorage.removeItem('current_scripture');
      }
    };

    return () => channel.close();
  }, []);

  // Action: Send Scripture
  const projectScripture = (scripture) => {
    console.log("Broadcasting:", scripture); // Debug log
    setLiveScripture(scripture);
    localStorage.setItem('current_scripture', JSON.stringify(scripture));

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'SHOW_SCRIPTURE', payload: scripture });
    channel.close(); // Close sender channel immediately after use
  };

  // Action: Clear Screen
  const clearProjection = () => {
    setLiveScripture(null);
    localStorage.removeItem('current_scripture');

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'CLEAR_SCREEN' });
    channel.close();
  };

  return (
    <ProjectionContext.Provider value={{ liveScripture, projectScripture, clearProjection }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjection = () => useContext(ProjectionContext);