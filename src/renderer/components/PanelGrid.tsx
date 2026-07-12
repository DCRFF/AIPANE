import React, { useCallback, useRef } from 'react';
import { useLayoutStore } from '../store';
import PanelView from './PanelView';

export default function PanelGrid() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const rowRatios = useLayoutStore((s) => s.rowRatios);
  const layoutMode = useLayoutStore((s) => s.layoutMode);

  const cols = Math.ceil(Math.sqrt(panels.length));
  const rows = Math.ceil(panels.length / cols);
  const isGrid = layoutMode === 'grid';

  const validRatios =
    panelRatios.length === panels.length
      ? panelRatios
      : panels.map(() => 1 / panels.length);

  // ── Grid template ──
  const gridColsFr = isGrid
    ? (() => {
        const raw = panels.slice(0, cols).map((_, ci) => panelRatios[ci] ?? 1 / cols);
        const sum = raw.reduce((a, b) => a + b, 0) || 1;
        return raw.map((r) => r / sum);
      })()
    : [];

  const gridRowsFr = isGrid
    ? Array.from({ length: rows }, (_, i) => rowRatios[i] ?? 1 / rows)
    : [];

  const rowFrSum = gridRowsFr.reduce((a, b) => a + b, 0) || 1;
  const normGridRows = gridRowsFr.map((r) => r / rowFrSum);

  const colFrSum = gridColsFr.reduce((a, b) => a + b, 0) || 1;
  const normGridCols = gridColsFr.map((r) => r / colFrSum);

  const containerStyle: React.CSSProperties = isGrid
    ? {
        display: 'grid',
        gap: 0,
        gridTemplateColumns: normGridCols.map((fr) => `${fr}fr`).join(' 8px '),
        gridTemplateRows: normGridRows.map((fr) => `${fr}fr`).join(' 8px '),
      }
    : {
        display: 'flex',
        flexDirection: layoutMode === 'horizontal' ? 'row' : 'column',
        gap: 0,
      };

  // ── Drag-to-reorder ──
  const dragRef = useRef<{
    index: number;
    offsetX: number;
    offsetY: number;
    prevTarget: number | null;
    panelEl: HTMLElement;
    gripEl: HTMLElement;
  } | null>(null);
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

    panelEl.classList.add('opacity-30', 'scale-95');
    dragRef.current = {
      index,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      prevTarget: null,
      panelEl,
      gripEl: e.currentTarget as HTMLElement,
    };

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

      const panelEls = document.querySelectorAll('[data-panel]');
      let target: number | null = null;
      for (const p of panelEls) {
        const r = p.getBoundingClientRect();
        if (
          ev.clientX >= r.left &&
          ev.clientX <= r.right &&
          ev.clientY >= r.top &&
          ev.clientY <= r.bottom
        ) {
          target = Number((p as HTMLElement).dataset.panelIndex);
          break;
        }
      }
      const newTarget = target !== null && target !== dragRef.current.index ? target : null;

      if (dragRef.current.prevTarget !== newTarget) {
        if (dragRef.current.prevTarget !== null) {
          const prevEl = document.querySelector(
            `[data-panel-index="${dragRef.current.prevTarget}"]`,
          ) as HTMLElement;
          if (prevEl) prevEl.style.outline = '';
        }
        if (newTarget !== null) {
          const nextEl = document.querySelector(
            `[data-panel-index="${newTarget}"]`,
          ) as HTMLElement;
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

      if (dragRef.current) {
        dragRef.current.panelEl.classList.remove('opacity-30', 'scale-95');
      }
      if (dragRef.current?.prevTarget !== null) {
        const prevEl = document.querySelector(
          `[data-panel-index="${dragRef.current.prevTarget}"]`,
        ) as HTMLElement;
        if (prevEl) prevEl.style.outline = '';
      }
      if (floatRef.current) floatRef.current.style.display = 'none';

      if (dragRef.current) {
        const panelEls = document.querySelectorAll('[data-panel]');
        let targetIndex = dragRef.current.index;
        for (const p of panelEls) {
          const r = p.getBoundingClientRect();
          if (
            ev.clientX >= r.left &&
            ev.clientX <= r.right &&
            ev.clientY >= r.top &&
            ev.clientY <= r.bottom
          ) {
            targetIndex = Number((p as HTMLElement).dataset.panelIndex);
            break;
          }
        }
        if (targetIndex !== dragRef.current.index) {
          const state = useLayoutStore.getState();
          const newPanels = [...state.panels];
          const newRatios = [...state.panelRatios];
          [newPanels[dragRef.current.index], newPanels[targetIndex]] = [
            newPanels[targetIndex],
            newPanels[dragRef.current.index],
          ];
          [newRatios[dragRef.current.index], newRatios[targetIndex]] = [
            newRatios[targetIndex],
            newRatios[dragRef.current.index],
          ];
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

  // ── Divider drag (flex mode) ──
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDividerDrag = useCallback(
    (index: number, axis: 'x' | 'y') => (e: React.PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const grip = e.currentTarget as HTMLElement;
      grip.setPointerCapture(e.pointerId);

      const startRatios = [...validRatios];
      const startPos = axis === 'x' ? e.clientX : e.clientY;
      const totalSize = axis === 'x' ? container.clientWidth : container.clientHeight;
      const pairSum = startRatios[index] + startRatios[index + 1];

      let latestAdjLeft = startRatios[index];
      let latestAdjRight = startRatios[index + 1];

      const onMove = (ev: PointerEvent) => {
        const currentPos = axis === 'x' ? ev.clientX : ev.clientY;
        const delta = currentPos - startPos;
        const deltaRatio = delta / totalSize;
        const leftRatio = Math.max(0.1, startRatios[index] + deltaRatio);
        const rightRatio = Math.max(0.1, startRatios[index + 1] - deltaRatio);
        const newPairSum = leftRatio + rightRatio;
        const scale = pairSum / newPairSum;
        latestAdjLeft = leftRatio * scale;
        latestAdjRight = rightRatio * scale;

        const panelEls = container.querySelectorAll('[data-panel]');
        const leftEl = panelEls[index] as HTMLElement;
        const rightEl = panelEls[index + 1] as HTMLElement;
        if (leftEl) leftEl.style.flex = `${latestAdjLeft} 1 0%`;
        if (rightEl) rightEl.style.flex = `${latestAdjRight} 1 0%`;
      };

      const onUp = () => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
        grip.releasePointerCapture(e.pointerId);

        const newRatios = [...startRatios];
        newRatios[index] = latestAdjLeft;
        newRatios[index + 1] = latestAdjRight;
        useLayoutStore.setState({ panelRatios: newRatios });
        window.api.updateSettings({
          panels: useLayoutStore.getState().panels,
          layoutMode,
          panelRatios: newRatios,
          rowRatios,
        });
      };

      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    },
    [validRatios, layoutMode, rowRatios],
  );

  // ── Needs padding for settings button ──
  const needsPadding = (i: number) => {
    if (layoutMode === 'horizontal') return i === panels.length - 1;
    if (layoutMode === 'vertical') return i === 0;
    return false;
  };

  // ── Panel grid placement ──
  const getPanelGridStyle = (i: number): React.CSSProperties | undefined => {
    if (!isGrid) return undefined;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const panelsInRow = row === rows - 1 ? panels.length - row * cols : cols;
    const colSpan = panelsInRow === 1 ? cols : 1;
    return {
      gridColumn: colSpan > 1 ? `1 / -1` : `${1 + col * 2} / ${2 + col * 2}`,
      gridRow: `${1 + row * 2} / ${2 + row * 2}`,
    };
  };

  // ── Render ──
  return (
    <div
      ref={containerRef}
      className="flex-1 p-2 overflow-hidden"
      style={containerStyle}
    >
      {panels.map((panel, i) => (
        <div
          key={panel.id}
          data-panel
          data-panel-index={i}
          className="flex min-w-0 min-h-0 overflow-hidden"
          style={
            isGrid
              ? getPanelGridStyle(i)
              : { flex: `${validRatios[i]} 1 0%` }
          }
        >
          <PanelView
            panelId={panel.id}
            panelUrl={panel.url}
            needsPadding={needsPadding(i)}
            index={i}
            onDragStart={handleDragStart}
          />
        </div>
      ))}

      {/* Flex-mode dividers */}
      {!isGrid &&
        panels.length > 1 &&
        Array.from({ length: panels.length - 1 }, (_, i) => (
          <div
            key={`div-${i}`}
            className={`relative shrink-0 group ${
              layoutMode === 'horizontal'
                ? 'w-2 cursor-col-resize'
                : 'h-2 cursor-row-resize'
            }`}
            onPointerDown={handleDividerDrag(i, layoutMode === 'horizontal' ? 'x' : 'y')}
          >
            <div
              className={`absolute rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200 ${
                layoutMode === 'horizontal'
                  ? 'inset-y-1 left-1/2 -translate-x-1/2 w-[3px]'
                  : 'inset-x-1 top-1/2 -translate-y-1/2 h-[3px]'
              }`}
            />
          </div>
        ))}

      {/* Grid-mode dividers */}
      {isGrid &&
        (() => {
          const els: React.ReactNode[] = [];
          // Horizontal dividers (between columns)
          for (let r = 0; r < rows; r++) {
            const panelsInRow =
              r === rows - 1 ? panels.length - r * cols : cols;
            if (panelsInRow <= 1) continue;
            for (let c = 0; c < panelsInRow - 1; c++) {
              els.push(
                <div
                  key={`gh-${r}-${c}`}
                  className="relative shrink-0 group w-2 cursor-col-resize"
                  style={{
                    gridColumn: `${2 + c * 2}`,
                    gridRow: `${1 + r * 2}`,
                  }}
                >
                  <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
                </div>,
              );
            }
          }
          // Vertical dividers (between rows)
          for (let r = 0; r < rows - 1; r++) {
            els.push(
              <div
                key={`gv-${r}`}
                className="relative shrink-0 group h-2 cursor-row-resize"
                style={{
                  gridColumn: '1 / -1',
                  gridRow: `${2 + r * 2}`,
                }}
              >
                <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
              </div>,
            );
          }
          return els;
        })()}

      {/* Floating drag card */}
      <div
        ref={floatRef}
        style={{
          display: 'none',
          position: 'fixed',
          zIndex: 100,
          pointerEvents: 'none',
        }}
        className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border-2 border-blue-400/50 opacity-95 rotate-1"
      >
        <div className="h-8 bg-gray-800 flex items-center px-2 shrink-0">
          <span className="float-url text-xs text-gray-300 truncate" />
        </div>
        <div
          className="bg-gray-900/90 flex items-center justify-center"
          style={{ minHeight: '60px' }}
        >
          <span className="text-gray-500 text-xs">拖拽中...</span>
        </div>
      </div>
    </div>
  );
}
