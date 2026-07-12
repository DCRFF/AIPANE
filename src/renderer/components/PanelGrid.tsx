import React, { useCallback } from 'react';
import { useLayoutStore } from '../store';
import PanelView from './PanelView';
import SplitPane from './SplitPane';

export default function PanelGrid() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const rowRatios = useLayoutStore((s) => s.rowRatios);
  const layoutMode = useLayoutStore((s) => s.layoutMode);

  const handlePanelRatios = useCallback(
    (r: number[]) => useLayoutStore.setState({ panelRatios: r }),
    [],
  );

  const handleRowRatios = useCallback(
    (r: number[]) => useLayoutStore.setState({ rowRatios: r }),
    [],
  );

  const cols = Math.ceil(Math.sqrt(panels.length));
  const rows = Math.ceil(panels.length / cols);

  // ── Grid mode: nested SplitPanes ──
  if (layoutMode === 'grid') {
    const effRowRatios =
      rowRatios.length === rows
        ? rowRatios
        : Array.from({ length: rows }, () => 1 / rows);

    const panelRows = Array.from({ length: rows }, (_, r) =>
      panels.slice(r * cols, Math.min((r + 1) * cols, panels.length)),
    );

    return (
      <div className="flex-1 p-2 flex overflow-hidden" style={{ flexDirection: 'column' }}>
        <SplitPane direction="vertical" ratios={effRowRatios} onRatiosChange={handleRowRatios}>
          {panelRows.map((rowPanels, rowIdx) => {
            const rowPanelRatios = rowPanels.map(
              (_, ci) => panelRatios[rowIdx * cols + ci] ?? 1 / rowPanels.length,
            );
            const handleRowPanelRatios = (r: number[]) => {
              const newRatios = [...panelRatios];
              for (let ci = 0; ci < r.length; ci++) {
                const pi = rowIdx * cols + ci;
                if (pi < newRatios.length) newRatios[pi] = r[ci];
              }
              useLayoutStore.setState({ panelRatios: newRatios });
            };
            return (
              <SplitPane
                key={rowIdx}
                direction="horizontal"
                ratios={rowPanelRatios}
                onRatiosChange={handleRowPanelRatios}
              >
                {rowPanels.map((panel, colIdx) => (
                  <PanelView
                    key={panel.id}
                    panelId={panel.id}
                    panelName={panel.name}
                    panelUrl={panel.url}
                    needsPadding={rowIdx === 0 && colIdx === rowPanels.length - 1}
                  />
                ))}
              </SplitPane>
            );
          })}
        </SplitPane>
      </div>
    );
  }

  // ── Horizontal / Vertical mode ──
  const validRatios =
    panelRatios.length === panels.length
      ? panelRatios
      : panels.map(() => 1 / panels.length);

  const needsPadding = (i: number) =>
    layoutMode === 'horizontal'
      ? i === panels.length - 1
      : i === 0;

  return (
    <div className="flex-1 p-2 flex overflow-hidden" style={{ flexDirection: 'column' }}>
      <SplitPane
        direction={layoutMode === 'horizontal' ? 'horizontal' : 'vertical'}
        ratios={validRatios}
        onRatiosChange={handlePanelRatios}
      >
        {panels.map((panel, i) => (
          <PanelView
            key={panel.id}
            panelId={panel.id}
            panelName={panel.name}
            panelUrl={panel.url}
            needsPadding={needsPadding(i)}
          />
        ))}
      </SplitPane>
    </div>
  );
}
