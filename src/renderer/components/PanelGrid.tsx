import { useCallback, useRef } from 'react';
import { useLayoutStore } from '../store';
import PanelSlot from './PanelSlot';

export default function PanelGrid() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const layoutDirection = useLayoutStore((s) => s.layoutDirection);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const grid = gridRef.current;
      if (!grid || panels.length < 2) return;

      const startPos = layoutDirection === 'horizontal' ? e.clientX : e.clientY;
      const totalSize =
        layoutDirection === 'horizontal' ? grid.getBoundingClientRect().width : grid.getBoundingClientRect().height;

      const onMove = (ev: MouseEvent) => {
        const currentPos = layoutDirection === 'horizontal' ? ev.clientX : ev.clientY;
        const delta = currentPos - startPos;
        const deltaRatio = delta / totalSize;

        const newRatios = [...panelRatios];
        const leftRatio = Math.max(0.1, newRatios[index] + deltaRatio);
        const rightRatio = Math.max(0.1, newRatios[index + 1] - deltaRatio);
        const total = leftRatio + rightRatio;
        newRatios[index] = leftRatio / total;
        newRatios[index + 1] = rightRatio / total;

        useLayoutStore.setState({ panelRatios: newRatios });
        window.api.updateLayout([]);
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [panels.length, panelRatios, layoutDirection],
  );

  return (
    <div
      ref={gridRef}
      className="flex-1 flex"
      style={{ flexDirection: layoutDirection === 'horizontal' ? 'row' : 'column' }}
    >
      {panels.map((panel, i) => (
        <div key={panel.id} className="flex" style={{ flex: panelRatios[i] ?? 1 / panels.length }}>
          <PanelSlot panelId={panel.id} />
          {i < panels.length - 1 && (
            <div
              className={`shrink-0 bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors ${
                layoutDirection === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
              }`}
              onMouseDown={handleDragStart(i)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
