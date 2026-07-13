import { useState, useEffect, useMemo } from 'react';
import { useLayoutStore } from '../store';
import type { AIService } from '../../shared/types';

const LAYOUT_MODES = [
  { value: 'horizontal' as const, label: '横向' },
  { value: 'vertical' as const, label: '纵向' },
  { value: 'grid' as const, label: '田字' },
];

const AI_PRESETS: AIService[] = [
  { id: 'deepseek',   name: 'DeepSeek',   url: 'https://chat.deepseek.com/', source: 'builtin' },
  { id: 'doubao',     name: '豆包',        url: 'https://www.doubao.com/',     source: 'builtin' },
  { id: 'chatgpt',    name: 'ChatGPT',    url: 'https://chatgpt.com/',         source: 'builtin' },
  { id: 'claude',     name: 'Claude',     url: 'https://claude.ai/',           source: 'builtin' },
  { id: 'gemini',     name: 'Gemini',     url: 'https://gemini.google.com/',   source: 'builtin' },
  { id: 'qianwen',    name: '通义千问',    url: 'https://www.qianwen.com/',     source: 'builtin' },
  { id: 'kimi',       name: 'Kimi',       url: 'https://kimi.moonshot.cn/',    source: 'builtin' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/',   source: 'builtin' },
];

export default function SettingsPanel() {
  const panels = useLayoutStore((s) => s.panels);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const panelOrder = useLayoutStore((s) => s.panelOrder);
  const setSettingsFromMain = useLayoutStore((s) => s.setSettings);
  const aiServices = useLayoutStore((s) => s.aiServices);
  const setAiServices = useLayoutStore((s) => s.setAiServices);

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
  const [selectedService, setSelectedService] = useState<AIService | null>(null);

  // Custom service form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [showCustomServices, setShowCustomServices] = useState(false);

  // Merged service list: presets first, then user customs
  const allServices = useMemo(() => [
    ...AI_PRESETS,
    ...aiServices.map((s) => ({ ...s, source: 'user' as const })),
  ], [aiServices]);

  // Load custom services on mount
  useEffect(() => {
    window.api.getAiServices().then((services) => {
      if (!Array.isArray(services)) return;
      setAiServices(services);
    });
  }, []);

  // Sync from settings:changed broadcast (multi-window)
  useEffect(() => {
    window.api.onSettingsChanged((settings) => {
      setAiServices(settings.aiServices ?? []);
    });
  }, []);

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
    const compositeKey = e.target.value;
    if (!compositeKey) {
      setSelectedService(null);
      return;
    }
    const [source, id] = compositeKey.split(':');
    const svc = allServices.find((s) => s.source === source && s.id === id);
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

  // ── Custom service handlers ──

  const handleAddCustom = async () => {
    setAddError(null);
    const result = await window.api.addAiService(newName, newUrl);
    if ('error' in result) {
      setAddError(result.error);
      return;
    }
    setAiServices(result);
    setNewName('');
    setNewUrl('');
  };

  const handleRemoveCustom = async (id: string) => {
    const result = await window.api.removeAiService(id);
    if ('error' in result) return;
    setAiServices(result);
  };

  const handleEditCustom = async (id: string) => {
    setEditError(null);
    const result = await window.api.editAiService(id, editName, editUrl);
    if ('error' in result) {
      setEditError(result.error);
      return;
    }
    setAiServices(result);
    setEditingId(null);
  };

  const handleStartEdit = (service: AIService) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditUrl(service.url);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const userServices = allServices.filter((s) => s.source === 'user');

  return (
    <div className="h-full p-6 overflow-y-auto">

      {/* ── Quick Add ── */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">快速添加 ({panels.length}/6)</label>
        <div className="flex items-center gap-2">
          <select
            onChange={handleQuickAdd}
            value={selectedService ? `${selectedService.source}:${selectedService.id}` : ''}
            disabled={panels.length >= 6}
            className="px-2 py-1 bg-gray-700 text-white text-sm rounded disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">选择AI服务</option>
            {allServices.map((s) => (
              <option key={`${s.source}:${s.id}`} value={`${s.source}:${s.id}`}>
                {s.source === 'builtin' ? s.name : `${s.name} (自定义)`}
              </option>
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

      {/* ── Panel Config ── */}
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

      {/* ── Layout Mode ── */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">布局方式</label>
        <div className="flex gap-2">
          {LAYOUT_MODES.map((m) => (
            <button key={m.value} onClick={() => handleLayoutMode(m.value)} className={`px-4 py-2 rounded text-sm ${layoutMode === m.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* ── Custom Services ── */}
      <div className="mb-6">
        <button
          onClick={() => setShowCustomServices(!showCustomServices)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-2"
        >
          <span className={`transform transition-transform ${showCustomServices ? 'rotate-90' : ''}`}>▸</span>
          自定义服务 ({userServices.length})
        </button>

        {showCustomServices && (
          <div className="space-y-2">
            {/* Presets (read-only) + User services (editable) */}
            {allServices.map((s) => {
              const isBuiltin = s.source === 'builtin';
              const isEditing = editingId === s.id;

              return (
                <div
                  key={`${s.source}:${s.id}`}
                  className={`p-2 rounded text-sm border border-gray-700 ${isBuiltin ? 'bg-gray-800/50' : 'bg-gray-800'}`}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-700 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="名称"
                        />
                        <button onClick={() => handleEditCustom(s.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">保存</button>
                        <button onClick={handleCancelEdit} className="px-2 py-1 text-xs bg-gray-600 text-white rounded">取消</button>
                      </div>
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="URL"
                      />
                      {editError && <p className="text-red-400 text-xs">{editError}</p>}
                    </div>
                  ) : (
                    /* Display mode */
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={isBuiltin ? 'text-gray-500' : 'text-white'}>
                          {s.name}
                        </span>
                        {isBuiltin && <span className="text-xs text-gray-600">(预设)</span>}
                        <span className="flex-1" />
                        {!isBuiltin && (
                          <>
                            <button onClick={() => handleStartEdit(s)} className="px-1.5 py-0.5 text-xs text-blue-400 hover:text-blue-300">编辑</button>
                            <button onClick={() => handleRemoveCustom(s.id)} className="px-1.5 py-0.5 text-xs text-red-400 hover:text-red-300">删除</button>
                          </>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isBuiltin ? 'text-gray-600' : 'text-gray-500'}`}>
                        {s.url}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add new custom service form */}
            <div className="p-2 rounded bg-gray-800/50 border border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-700 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="服务名称"
                  />
                  <button onClick={handleAddCustom} className="px-2 py-1 text-xs bg-green-600 text-white rounded">添加</button>
                </div>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
                {addError && <p className="text-red-400 text-xs">{addError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
