import { useCallback, useRef } from 'react';
import { useLayoutStore } from '../store';
import PanelView from './PanelView';

export default function PanelGrid() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const grid = gridRef.current;
      if (!grid || panels.length < 2 || layoutMode === 'grid') return;
      const startPos = layoutMode === 'horizontal' ? e.clientX : e.clientY;
      const totalSize = layoutMode === 'horizontal' ? grid.getBoundingClientRect().width : grid.getBoundingClientRect().height;
      const onMove = (ev: MouseEvent) => {
        const currentPos = layoutMode === 'horizontal' ? ev.clientX : ev.clientY;
        const delta = currentPos - startPos;
        const deltaRatio = delta / totalSize;
        const newRatios = [...panelRatios];
        const leftRatio = Math.max(0.1, newRatios[index] + deltaRatio);
        const rightRatio = Math.max(0.1, newRatios[index + 1] - deltaRatio);
        const total = leftRatio + rightRatio;
        newRatios[index] = leftRatio / total;
        newRatios[index + 1] = rightRatio / total;
        useLayoutStore.setState({ panelRatios: newRatios });
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [panels.length, panelRatios, layoutMode],
  );

  const cols = Math.ceil(Math.sqrt(panels.length));

  return (
    <div ref={gridRef} className="flex-1" style={{ display: layoutMode === 'grid' ? 'grid' : 'flex', flexDirection: layoutMode === 'vertical' ? 'column' : 'row', gridTemplateColumns: layoutMode === 'grid' ? `repeat(${cols}, 1fr)` : undefined, gap: layoutMode === 'grid' ? 4 : 2 }}>
      {panels.map((panel, i) => (
        <div key={panel.id} className="flex" style={layoutMode !== 'grid' ? { flex: panelRatios[i] ?? 1 / panels.length } : undefined}>
          <PanelView panelId={panel.id} panelName={panel.name} panelUrl={panel.url} showSettingsBtn={i === panels.length - 1} />
          {i < panels.length - 1 && layoutMode !== 'grid' && (
            <div className={`shrink-0 bg-gray-600 hover:bg-blue-500 transition-colors ${layoutMode === 'horizontal' ? 'w-[6px] cursor-col-resize' : 'h-[6px] cursor-row-resize'}`} onMouseDown={handleDragStart(i)} />
          )}
        </div>
      ))}
    </div>
  );
}
