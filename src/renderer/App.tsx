import { useEffect } from 'react';
import Toolbar from './components/Toolbar';
import PanelGrid from './components/PanelGrid';
import { useLayoutStore } from './store';
import { useLayout } from './hooks/useLayout';

export default function App() {
  const setSettings = useLayoutStore((s) => s.setSettings);
  const panels = useLayoutStore((s) => s.panels);

  useEffect(() => {
    window.api.getSettings().then((settings) => {
      setSettings(settings);
      const isDefault =
        settings.panels.length === 2 &&
        settings.panels[0]?.url === 'https://www.doubao.com/' &&
        settings.panels[1]?.url === 'https://chat.deepseek.com/';
      if (isDefault) {
        window.api.openSettings();
      }
    });
  }, [setSettings]);
  // 监听设置窗口的变更
  useEffect(() => {
    window.api.onSettingsChanged((settings) => {
      setSettings(settings);
    });
  }, [setSettings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      switch (e.key) {
        case 't':
          e.preventDefault();
          window.api.addPanel('https://chat.deepseek.com/').then(setSettings);
          break;
        case 'w':
          e.preventDefault();
          if (panels.length > 2) {
            window.api.removePanel(panels[panels.length - 1].id).then(setSettings);
          }
          break;
        case 'l':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panels, setSettings]);

  useLayout();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar />
      <PanelGrid />
    </div>
  );
}
