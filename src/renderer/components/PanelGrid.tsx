import React, { useCallback, useState, useRef } from 'react';
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




  const dragRef = useRef<{ index: number; offsetX: number; offsetY: number; prevTarget: number | null; panelEl: HTMLElement; gripEl: HTMLElement } | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    const panelEl = (e.currentTarget as HTMLElement).closest('[data-panel]') as HTMLElement;
    if (!panelEl) return;
    const index = Number(panelEl.dataset.panelIndex);
    if (isNaN(index)) return;

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const state = useLayoutStore.getState();
    const url = state.panels[index]?.url || '';
    const rect = panelEl.getBoundingClientRect();

    // Dim the dragged panel via DOM
    panelEl.classList.add('opacity-30', 'scale-95');
    dragRef.current = { index, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, prevTarget: null, panelEl, gripEl: e.currentTarget as HTMLElement };

    if (floatRef.current) {
      floatRef.current.style.display = '';
      floatRef.current.style.left = `${rect.left}px`;
      floatRef.current.style.top = `${rect.top}px`;
      floatRef.current.style.width = `${rect.width}px`;
      floatRef.current.style.height = `${rect.height}px`;
      const urlEl = floatRef.current.querySelector('.float-url');
      if (urlEl) urlEl.textContent = url;
    }

    const preventSelect = (ev: Event) => ev.preventDefault();
    document.addEventListener('selectstart', preventSelect);

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || !floatRef.current) return;
      floatRef.current.style.left = `${ev.clientX - dragRef.current.offsetX}px`;
      floatRef.current.style.top = `${ev.clientY - dragRef.current.offsetY}px`;

      const panels = document.querySelectorAll('[data-panel]');
      let target: number | null = null;
      for (const p of panels) {
        const r = p.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right &&
            ev.clientY >= r.top && ev.clientY <= r.bottom) {
          target = Number((p as HTMLElement).dataset.panelIndex);
          break;
        }
      }
      const newTarget = target !== null && target !== dragRef.current.index ? target : null;

      if (dragRef.current.prevTarget !== newTarget) {
        if (dragRef.current.prevTarget !== null) {
          const prevEl = document.querySelector(`[data-panel-index="${dragRef.current.prevTarget}"]`) as HTMLElement;
          if (prevEl) prevEl.style.outline = '';
        }
        if (newTarget !== null) {
          const nextEl = document.querySelector(`[data-panel-index="${newTarget}"]`) as HTMLElement;
          if (nextEl) nextEl.style.outline = '2px solid #3b82f6';
        }
        dragRef.current.prevTarget = newTarget;
      }
    };

    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('selectstart', preventSelect);
      if (dragRef.current) dragRef.current.gripEl.releasePointerCapture(ev.pointerId);

      // Restore dragged panel
      if (dragRef.current) {
        dragRef.current.panelEl.classList.remove('opacity-30', 'scale-95');
      }

      // Clean up highlight
      if (dragRef.current?.prevTarget !== null) {
        const prevEl = document.querySelector(`[data-panel-index="${dragRef.current.prevTarget}"]`) as HTMLElement;
        if (prevEl) prevEl.style.outline = '';
      }

      if (floatRef.current) floatRef.current.style.display = 'none';

      if (dragRef.current) {
        const panels = document.querySelectorAll('[data-panel]');
        let targetIndex = dragRef.current.index;
        for (const p of panels) {
          const r = p.getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right &&
              ev.clientY >= r.top && ev.clientY <= r.bottom) {
            targetIndex = Number((p as HTMLElement).dataset.panelIndex);
            break;
          }
        }
        if (targetIndex !== dragRef.current.index) {
          const state = useLayoutStore.getState();
          const newPanels = [...state.panels];
          const newRatios = [...state.panelRatios];
          [newPanels[dragRef.current.index], newPanels[targetIndex]] = [newPanels[targetIndex], newPanels[dragRef.current.index]];
          [newRatios[dragRef.current.index], newRatios[targetIndex]] = [newRatios[targetIndex], newRatios[dragRef.current.index]];
          useLayoutStore.setState({ panels: newPanels, panelRatios: newRatios });
          window.api.updateSettings({
            panels: newPanels,
            layoutMode: state.layoutMode,
            panelRatios: newRatios,
            rowRatios: state.rowRatios,
          });
        }
      }

      dragRef.current = null;
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, []);

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
            const rawRatios = rowPanels.map(
              (_, ci) => panelRatios[rowIdx * cols + ci] ?? 1 / rowPanels.length,
            );
            const rowSum = rawRatios.reduce((a, b) => a + b, 0) || 1;
            const rowPanelRatios = rawRatios.map((r) => r / rowSum);
            const handleRowPanelRatios = (r: number[]) => {
              const newRatios = [...panelRatios];
              for (let ci = 0; ci < r.length; ci++) {
                const pi = rowIdx * cols + ci;
                if (pi < newRatios.length) newRatios[pi] = r[ci] * rowSum;
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
                    panelUrl={panel.url}
                    needsPadding={rowIdx === 0 && colIdx === rowPanels.length - 1}
                    index={rowIdx * cols + colIdx}
                    onDragStart={handleDragStart}
                  />
                ))}
              </SplitPane>
            );
          })}
        </SplitPane>
        <div
          ref={floatRef}
          style={{ display: 'none', position: 'fixed', zIndex: 100, pointerEvents: 'none' }}
          className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border-2 border-blue-400/50 opacity-95 rotate-1"
        >
          <div className="h-8 bg-gray-800 flex items-center px-2 shrink-0">
            <span className="float-url text-xs text-gray-300 truncate"></span>
          </div>
          <div className="bg-gray-900/90 flex items-center justify-center" style={{ minHeight: '60px' }}>
            <span className="text-gray-500 text-xs">拖拽中...</span>
          </div>
        </div>
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
            panelUrl={panel.url}
            needsPadding={needsPadding(i)}
            index={i}
            onDragStart={handleDragStart}
          />
        ))}
      </SplitPane>
      <div
        ref={floatRef}
        style={{ display: 'none', position: 'fixed', zIndex: 100, pointerEvents: 'none' }}
        className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border-2 border-blue-400/50 opacity-95 rotate-1"
      >
        <div className="h-8 bg-gray-800 flex items-center px-2 shrink-0">
          <span className="float-url text-xs text-gray-300 truncate"></span>
        </div>
        <div className="bg-gray-900/90 flex items-center justify-center" style={{ minHeight: '60px' }}>
          <span className="text-gray-500 text-xs">拖拽中...</span>
        </div>
      </div>
    </div>
  );
}
