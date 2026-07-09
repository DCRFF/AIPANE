import { useLayoutStore } from '../store';
import AddressBar from './AddressBar';

export default function Toolbar() {
  const panels = useLayoutStore((s) => s.panels);
  const setSettings = useLayoutStore((s) => s.setSettings);

  const handleRemove = (id: string) => {
    if (panels.length <= 1) return;
    window.api.removePanel(id).then(setSettings);
  };

  return (
    <div className="h-12 bg-gray-800 flex items-center px-4 gap-2 shrink-0">
      <span className="text-sm font-semibold text-gray-300 mr-2 shrink-0">多栏浏览器</span>

      {panels.map((panel) => (
        <div key={panel.id} className="flex items-center gap-1 flex-1 min-w-0">
          <AddressBar panelId={panel.id} currentUrl={panel.url} panelName={panel.name} />
          <button
            onClick={() => handleRemove(panel.id)}
            disabled={panels.length <= 1}
            className="px-2 py-1 text-xs text-gray-400 hover:text-red-400 disabled:opacity-30 shrink-0"
            title="移除面板"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={() => window.api.toggleSettings()}
        className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 shrink-0"
      >
        ⚙
      </button>
    </div>
  );
}
