import { useState } from 'react';

interface Props {
  panelId: string;
  currentUrl: string;
  panelName: string;
}

export default function AddressBar({ panelId, currentUrl, panelName }: Props) {
  const [value, setValue] = useState(currentUrl);
  const [name, setName] = useState(panelName);
  const [editing, setEditing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const url = value.trim();
      if (url) window.api.navigate(panelId, url);
    }
  };

  const handleNameSubmit = () => {
    setEditing(false);
    if (name.trim() && name !== panelName) {
      window.api.renamePanel(panelId, name.trim());
    } else {
      setName(panelName);
    }
  };

  return (
    <div className="flex items-center gap-1 min-w-0">
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          className="w-16 shrink-0 px-1 py-0.5 bg-gray-600 text-gray-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 cursor-pointer hover:text-gray-200 shrink-0 select-none"
        >
          {name}
        </span>
      )}
      <button onClick={() => window.api.goBack(panelId)} className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0">←</button>
      <button onClick={() => window.api.goForward(panelId)} className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0">→</button>
      <button onClick={() => window.api.reload(panelId)} className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0">↻</button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-40 px-2 py-1 bg-gray-700 text-gray-200 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="网址..."
      />
    </div>
  );
}
