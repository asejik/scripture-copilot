import React, { useState, useEffect } from 'react';

const SongEditorModal = ({ isOpen, onClose, onSave, songToEdit }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [key, setKey] = useState('');
  const [lyrics, setLyrics] = useState('');

  // Load data if editing, or reset if new
  useEffect(() => {
    if (isOpen) {
        if (songToEdit) {
            setTitle(songToEdit.title);
            setAuthor(songToEdit.author || '');
            setKey(songToEdit.key || '');
            setLyrics(songToEdit.lyrics || '');
        } else {
            setTitle('');
            setAuthor('');
            setKey('');
            setLyrics('');
        }
    }
  }, [isOpen, songToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
        id: songToEdit?.id, // Keep ID if editing
        title,
        author,
        key,
        lyrics
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{songToEdit ? 'Edit Song' : 'New Song'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Song Title</label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. Way Maker" />
                </div>
                <div className="col-span-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Musical Key</label>
                    <input type="text" value={key} onChange={e => setKey(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. G Major" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Author / Artist</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. Sinach" />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Lyrics</label>
                    <span className="text-[10px] text-slate-500 italic">Separate slides with blank lines</span>
                </div>
                <textarea
                    required
                    value={lyrics}
                    onChange={e => setLyrics(e.target.value)}
                    className="w-full flex-1 min-h-[200px] bg-slate-950 border border-slate-700 rounded p-4 text-white font-mono text-sm leading-relaxed focus:border-blue-500 outline-none resize-none"
                    placeholder={"Verse 1\nLine 1 of text\nLine 2 of text\n\nChorus\nLine 1 of chorus..."}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-transform active:scale-95">Save Song</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SongEditorModal;