import { useState } from 'react';
import { useLayoutStore } from '../store';

const LAYOUT_MODES = [
  { value: 'horizontal' as const, label: '横向' },
  { value: 'vertical' as const, label: '纵向' },
  { value: 'grid' as const, label: '田字' },
];

const AI_SERVICES = [
  { name: 'DeepSeek',   url: 'https://chat.deepseek.com/' },
  { name: '豆包',        url: 'https://www.doubao.com/' },
  { name: 'ChatGPT',    url: 'https://chatgpt.com/' },
  { name: 'Claude',     url: 'https://claude.ai/' },
  { name: 'Gemini',     url: 'https://gemini.google.com/' },
  { name: '通义千问',    url: 'https://www.qianwen.com/' },
  { name: 'Kimi',       url: 'https://kimi.moonshot.cn/' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/' },
];

export default function SettingsPanel() {
  const panels = useLayoutStore((s) => s.panels);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const panelOrder = useLayoutStore((s) => s.panelOrder);
  const setSettingsFromMain = useLayoutStore((s) => s.setSettings);

  const [localUrls, setLocalUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    panels.forEach((p) => (map[p.id] = p.url));
    return map;
  });
  const [localNames, setLocalNames] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    panels.forEach((p) => (map[p.id] = p.name));
    return map;
  });
  const [selectedService, setSelectedService] = useState<{ name: string; url: string } | null>(null);

  const handleUrlChange = (id: string, url: string) => {
    setLocalUrls((prev) => ({ ...prev, [id]: url }));
    window.api.navigate(id, url).then(setSettingsFromMain);
  };

  const handleNameChange = (id: string, name: string) => {
    setLocalNames((prev) => ({ ...prev, [id]: name }));
    window.api.renamePanel(id, name).then(setSettingsFromMain);
  };

  const handleRemove = async (id: string) => {
    if (panels.length <= 1) return;
    const s = await window.api.removePanel(id);
    setSettingsFromMain(s);
  };

  const handleAdd = async () => {
    if (panels.length >= 6) return;
    const url = selectedService?.url ?? 'about:blank';
    const s = await window.api.addPanel(url, selectedService?.name);
    setSettingsFromMain(s);
  };

  const handleQuickAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = e.target.value;
    if (!url) {
      setSelectedService(null);
      return;
    }
    const svc = AI_SERVICES.find((s) => s.url === url);
    if (svc) setSelectedService(svc);
  };

  const handleLayoutMode = async (mode: 'horizontal' | 'vertical' | 'grid') => {
    const panelRatios = panels.map(() => 1 / panels.length);
    const cols = Math.ceil(Math.sqrt(panels.length));
    const rows = Math.ceil(panels.length / cols);
    const rowRatios = mode === 'grid' ? Array.from({ length: rows }, () => 1 / rows) : [];
    const newSettings = { panels, layoutMode: mode, panelRatios, rowRatios, panelOrder };
    await window.api.updateSettings(newSettings);
    setSettingsFromMain(newSettings);
  };

  return (
    <div className="h-full p-6 overflow-y-auto">

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">面板数量 ({panels.length}/6)</label>
        <div className="flex items-center gap-2">
          <select
            onChange={handleQuickAdd}
            value={selectedService?.url ?? ''}
            disabled={panels.length >= 6}
            className="px-2 py-1 bg-gray-700 text-white text-sm rounded disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">选择AI服务</option>
            {AI_SERVICES.map((s) => (
              <option key={s.url} value={s.url}>{s.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} disabled={panels.length >= 6} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-30">+</button>
        </div>
        {selectedService && (
          <div className="mt-1 text-xs text-gray-500">
            {selectedService.name} — {selectedService.url}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">面板配置</label>
        {panels.map((panel, i) => (
          <div key={panel.id} className="mb-3 pb-3 border-b border-gray-700 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">面板 {i + 1}</span>
              <input
                type="text"
                value={localNames[panel.id] ?? panel.name}
                onChange={(e) => handleNameChange(panel.id, e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-700 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="名称"
              />
              <button onClick={() => handleRemove(panel.id)} disabled={panels.length <= 1} className="px-2 py-1 text-xs text-gray-400 hover:text-red-400 disabled:opacity-30 shrink-0">✕</button>
            </div>
            <input type="text" value={localUrls[panel.id] ?? panel.url} onChange={(e) => handleUrlChange(panel.id, e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="URL" />
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
