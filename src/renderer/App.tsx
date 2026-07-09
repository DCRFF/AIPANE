import { useEffect } from 'react';
import PanelGrid from './components/PanelGrid';
import { useLayoutStore } from './store';

export default function App() {
  const setSettings = useLayoutStore((s) => s.setSettings);
  const panels = useLayoutStore((s) => s.panels);

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
    <div className="h-screen flex flex-col bg-gray-900">
      <PanelGrid />
    </div>
  );
}
