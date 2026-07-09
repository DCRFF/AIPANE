import { useState } from 'react';
import { useLayoutStore } from '../store';

interface Props {
  onClose: () => void;
}

const LAYOUT_MODES = [
  { value: 'horizontal' as const, label: '横向' },
  { value: 'vertical' as const, label: '纵向' },
  { value: 'grid' as const, label: '田字' },
];

export default function SettingsPanel({ onClose }: Props) {
  const panels = useLayoutStore((s) => s.panels);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const setSettingsFromMain = useLayoutStore((s) => s.setSettings);

  const [localUrls, setLocalUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    panels.forEach((p) => (map[p.id] = p.url));
    return map;
  });

  const handleUrlChange = (id: string, url: string) => {
    setLocalUrls((prev) => ({ ...prev, [id]: url }));
    window.api.navigate(id, url).then(setSettingsFromMain);
  };

  const handleAdd = async () => {
    if (panels.length >= 6) return;
    const s = await window.api.addPanel('about:blank');
    setSettingsFromMain(s);
  };

  const handleRemove = async (id: string) => {
    if (panels.length <= 1) return;
    const s = await window.api.removePanel(id);
    setSettingsFromMain(s);
  };

  const handleLayoutMode = async (mode: 'horizontal' | 'vertical' | 'grid') => {
    await window.api.updateSettings({
      panels,
      layoutMode: mode,
      panelRatios: panels.map(() => 1 / panels.length),
    });
    setSettingsFromMain({
      panels,
      layoutMode: mode,
      panelRatios: panels.map(() => 1 / panels.length),
    });
  };

  return (
    <div className="h-full bg-gray-800 p-6 overflow-y-auto border-l border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">设置</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">面板数量 ({panels.length}/6)</label>
        <div className="flex gap-2">
          <button onClick={handleAdd} disabled={panels.length >= 6} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-30">+</button>
          <button onClick={() => { const last = panels[panels.length - 1]; if (last) handleRemove(last.id); }} disabled={panels.length <= 1} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-30">-</button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">面板 URL</label>
        {panels.map((panel, i) => (
          <div key={panel.id} className="mb-2">
            <div className="text-xs text-gray-500 mb-1">面板 {i + 1}</div>
            <input type="text" value={localUrls[panel.id] ?? panel.url} onChange={(e) => handleUrlChange(panel.id, e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">布局方式</label>
        <div className="flex gap-2">
          {LAYOUT_MODES.map((m) => (
            <button key={m.value} onClick={() => handleLayoutMode(m.value)} className={`px-4 py-2 rounded text-sm ${layoutMode === m.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>{m.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
