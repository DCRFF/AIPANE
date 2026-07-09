import { useState } from 'react';

interface Props {
  panelId: string;
  currentUrl: string;
}

export default function AddressBar({ panelId, currentUrl }: Props) {
  const [value, setValue] = useState(currentUrl);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const url = value.trim();
      if (url) {
        window.api.navigate(panelId, url);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <button
        onClick={() => window.api.goBack(panelId)}
        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0"
        title="后退"
      >
        ←
      </button>
      <button
        onClick={() => window.api.goForward(panelId)}
        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0"
        title="前进"
      >
        →
      </button>
      <button
        onClick={() => window.api.reload(panelId)}
        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0"
        title="刷新"
      >
        ↻
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-3 py-1 bg-gray-700 text-gray-200 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
        placeholder="输入网址..."
      />
    </div>
  );
}
