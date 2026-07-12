import { useState, useEffect } from 'react';
import PanelGrid from './components/PanelGrid';
import SettingsPanel from './components/SettingsPanel';
import { useLayoutStore } from './store';

export default function App() {
  const setSettings = useLayoutStore((s) => s.setSettings);
  const panels = useLayoutStore((s) => s.panels);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    window.api.getSettings().then(setSettings);
  }, [setSettings]);

  useEffect(() => {
    window.api.onSettingsChanged(setSettings);
  }, [setSettings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === 't') { e.preventDefault(); window.api.addPanel('about:blank').then(setSettings); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSettings]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 relative">
      <PanelGrid />
      <button
        onClick={() => setShowSettings((v) => !v)}
        className="absolute top-2 right-2 z-50 flex items-center px-2 h-8 text-gray-400 text-sm select-none"
      >
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-800 hover:bg-gray-700 hover:text-white">
          <span className="text-xs">设置</span>
          <span>⚙</span>
        </span>
      </button>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-out ${showSettings ? 'bg-black/40 pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={() => setShowSettings(false)}
      >
        <div
          className={`absolute top-0 right-0 w-96 h-full bg-gray-800 border-l border-gray-700 rounded-l-xl transition-transform duration-300 ease-out ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}
