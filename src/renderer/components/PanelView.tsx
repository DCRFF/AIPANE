import { useState, useRef } from 'react';

interface Props {
  panelId: string;
  panelUrl: string;
  needsPadding?: boolean;
}


export default function PanelView({ panelId, panelUrl, needsPadding }: Props) {
  const [url, setUrl] = useState(panelUrl);
  const webviewRef = useRef<any>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const u = url.trim();
      if (u && webviewRef.current) webviewRef.current.loadURL(u);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 rounded-xl overflow-hidden shadow-lg shadow-black/30 border border-gray-700/40">
      <div className={`h-8 bg-gray-800/90 flex items-center gap-1 px-2 shrink-0 ${needsPadding ? 'pr-[72px]' : ''}`}>
        <button onClick={() => webviewRef.current?.goBack()} className="px-1 py-0.5 text-[10px] bg-gray-700/80 text-gray-300 rounded hover:bg-gray-600 shrink-0">←</button>
        <button onClick={() => webviewRef.current?.goForward()} className="px-1 py-0.5 text-[10px] bg-gray-700/80 text-gray-300 rounded hover:bg-gray-600 shrink-0">→</button>
        <button onClick={() => webviewRef.current?.reload()} className="px-1 py-0.5 text-[10px] bg-gray-700/80 text-gray-300 rounded hover:bg-gray-600 shrink-0">↻</button>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 px-2 py-0.5 bg-gray-700/60 text-gray-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0" placeholder="网址..." />
        <button onClick={() => window.api.removePanel(panelId)} className="px-1.5 text-[10px] text-gray-400 hover:text-red-400 shrink-0">✕</button>
      </div>
      <webview ref={webviewRef} src={url} className="flex-1" style={{ display: 'flex' }} />
    </div>
  );
}
