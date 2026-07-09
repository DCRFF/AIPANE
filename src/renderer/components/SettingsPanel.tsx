import { useState } from 'react';
import { useLayoutStore } from '../store';

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const panels = useLayoutStore((s) => s.panels);
  const layoutDirection = useLayoutStore((s) => s.layoutDirection);
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
    if (panels.length >= 5) return;
    const newSettings = await window.api.addPanel('https://chat.deepseek.com/');
    setSettingsFromMain(newSettings);
  };

  const handleRemove = async (id: string) => {
    if (panels.length <= 2) return;
    const newSettings = await window.api.removePanel(id);
    setSettingsFromMain(newSettings);
  };

  const handleToggleLayout = async () => {
    const newDir = layoutDirection === 'horizontal' ? 'vertical' : 'horizontal';
    await window.api.updateSettings({
      panels,
      layoutDirection: newDir,
      panelRatios: panels.map(() => 1 / panels.length),
    });
    setSettingsFromMain({
      panels,
      layoutDirection: newDir,
      panelRatios: panels.map(() => 1 / panels.length),
    });
  };

  return (
    <div className="h-full bg-gray-800 p-6 overflow-y-auto border-l border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">设置</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
          ✕
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          面板数量 ({panels.length}/5)
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={panels.length >= 5}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-30"
          >
            +
          </button>
          <button
            onClick={() => {
              const last = panels[panels.length - 1];
              if (last) handleRemove(last.id);
            }}
            disabled={panels.length <= 2}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-30"
          >
            -
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">面板 URL</label>
        {panels.map((panel, i) => (
          <div key={panel.id} className="mb-2">
            <div className="text-xs text-gray-500 mb-1">面板 {i + 1}</div>
            <input
              type="text"
              value={localUrls[panel.id] ?? panel.url}
              onChange={(e) => handleUrlChange(panel.id, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">布局方向</label>
        <div className="flex gap-2">
          <button
            onClick={handleToggleLayout}
            className="px-4 py-2 bg-gray-700 text-white rounded text-sm"
          >
            {layoutDirection === 'horizontal' ? '横向 → 纵向' : '纵向 → 横向'}
          </button>
        </div>
      </div>
    </div>
  );
}
