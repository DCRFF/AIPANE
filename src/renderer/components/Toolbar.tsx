import { useLayoutStore } from '../store';
import AddressBar from './AddressBar';

export default function Toolbar() {
  const panels = useLayoutStore((s) => s.panels);

  return (
    <div className="h-12 bg-gray-800 flex items-center px-4 gap-2 shrink-0">
      <span className="text-sm font-semibold text-gray-300 mr-2 shrink-0">多栏浏览器</span>

      {panels.map((panel, i) => (
        <AddressBar key={panel.id} panelId={panel.id} currentUrl={panel.url} />
      ))}

      <button
        onClick={() => window.api.toggleSettings()}
      >
        ⚙
      </button>
    </div>
  );
}
