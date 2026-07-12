import React, { useCallback, useRef } from 'react';
import { useLayoutStore } from '../store';
import PanelView from './PanelView';

/** Build alternating "fr 8px fr 8px … fr" track string */
function trackStr(ratios: number[]): string {
  return ratios.map((r, i) => (i === 0 ? '' : ' 8px ') + `${r}fr`).join('');
}

export default function PanelGrid() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const rowRatios = useLayoutStore((s) => s.rowRatios);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const panelOrder = useLayoutStore((s) => s.panelOrder);

  const order =
    panelOrder.length === panels.length
      ? panelOrder
      : panels.map((_, i) => i);

  const validRatios =
    panelRatios.length === panels.length
      ? panelRatios
      : panels.map(() => 1 / panels.length);

  // ── Grid dimensions ──
  const cols =
    layoutMode === 'horizontal' ? panels.length :
    layoutMode === 'vertical'   ? 1 :
    Math.ceil(Math.sqrt(panels.length));
  const rows = Math.ceil(panels.length / cols);

  // ── Row ratios (grid only) ──
  const normRowRatios = (() => {
    if (layoutMode !== 'grid') return [];
    const rr = Array.from({ length: rows }, (_, i) => rowRatios[i] ?? 1 / rows);
    const sum = rr.reduce((a, b) => a + b, 0) || 1;
    return rr.map((r) => r / sum);
  })();

  // ── Per-row panel data ──
  const gridRows = (() => {
    if (layoutMode !== 'grid') return [];
    const result: { vpStart: number; count: number }[] = [];
    let vp = 0;
    for (let r = 0; r < rows; r++) {
      const count = r === rows - 1 ? panels.length - r * cols : cols;
      result.push({ vpStart: vp, count });
      vp += count;
    }
    return result;
  })();

  // ── Container style ──
  const containerRef = useRef<HTMLDivElement>(null);
  const containerStyle: React.CSSProperties = (() => {
    if (layoutMode === 'horizontal') {
      return {
        display: 'grid',
        gap: 0,
        gridTemplateColumns: trackStr(validRatios),
        gridTemplateRows: '1fr',
      };
    }
    if (layoutMode === 'vertical') {
      return {
        display: 'grid',
        gap: 0,
        gridTemplateColumns: '1fr',
        gridTemplateRows: trackStr(validRatios),
      };
    }
    // grid: outer flex column
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    };
  })();

  // ── Panel grid placement ──
  const getPanelStyle = (vp: number): React.CSSProperties => {
    const col = vp % cols;
    const row = Math.floor(vp / cols);
    const panelsInRow = row === rows - 1 ? panels.length - row * cols : cols;
    const colSpan = panelsInRow === 1 ? cols : 1;
    return {
      gridColumn: colSpan > 1 ? '1 / -1' : `${1 + col * 2} / ${2 + col * 2}`,
      gridRow: '1 / 2',
    };
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
          const newOrder = [...(state.panelOrder.length === state.panels.length ? state.panelOrder : state.panels.map((_, idx) => idx))];
          [newOrder[dragRef.current.index], newOrder[targetIndex]] = [
            newOrder[targetIndex],
            newOrder[dragRef.current.index],
          ];
          useLayoutStore.setState({ panelOrder: newOrder });
          window.api.updateSettings({
            panels: state.panels,
            layoutMode: state.layoutMode,
            panelRatios: state.panelRatios,
            rowRatios: state.rowRatios,
            panelOrder: newOrder,
          });
        }
      }
      dragRef.current = null;
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, []);

  // ── Divider drag ──
  const handleColDividerDrag = useCallback(
    (rowIndex: number, gapIndex: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      const grip = e.currentTarget as HTMLElement;
      const rowEl = grip.closest<HTMLDivElement>('[data-grid-row]');
      if (!rowEl) return;

      grip.setPointerCapture(e.pointerId);

      const vpStart = gridRows[rowIndex]?.vpStart ?? 0;
      const i0 = vpStart + gapIndex;
      const i1 = i0 + 1;
      const startRatios = [...validRatios];
      const startPos = e.clientX;
      const totalSize = rowEl.clientWidth;
      const rawSlice = startRatios.slice(vpStart, vpStart + (gridRows[rowIndex]?.count ?? 0));
      const rSum = rawSlice.reduce((a, b) => a + b, 0) || 1;
      const startSlice = rawSlice.map((r) => r / rSum);

      let latestLeft = startSlice[gapIndex];
      let latestRight = startSlice[gapIndex + 1];

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startPos;
        const deltaRatio = delta / totalSize;
        const leftRatio = Math.max(0.1, startSlice[gapIndex] + deltaRatio);
        const rightRatio = Math.max(0.1, startSlice[gapIndex + 1] - deltaRatio);
        const newPairSum = leftRatio + rightRatio;
        const scale = (startSlice[gapIndex] + startSlice[gapIndex + 1]) / newPairSum;
        latestLeft = leftRatio * scale;
        latestRight = rightRatio * scale;

        const newSlice = [...startSlice];
        newSlice[gapIndex] = latestLeft;
        newSlice[gapIndex + 1] = latestRight;
        rowEl.style.gridTemplateColumns = trackStr(newSlice);
      };

      const rawSum = rawSlice.reduce((a, b) => a + b, 0) || 1;

      const onUp = () => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
        grip.releasePointerCapture(e.pointerId);

        const newRatios = [...startRatios];
        newRatios[i0] = latestLeft * rawSum;
        newRatios[i1] = latestRight * rawSum;
        useLayoutStore.setState({ panelRatios: newRatios });
        const s = useLayoutStore.getState();
        window.api.updateSettings({
          panels: s.panels,
          layoutMode,
          panelRatios: newRatios,
          rowRatios,
          panelOrder: s.panelOrder,
        });
      };

      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    },
    [validRatios, layoutMode, rowRatios, gridRows],
  );

  const handleRowDividerDrag = useCallback(
    (index: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const grip = e.currentTarget as HTMLElement;
      grip.setPointerCapture(e.pointerId);

      const source = rowRatios.length ? rowRatios : Array.from({ length: rows }, () => 1 / rows);
      const startRatios = [...source];
      const startPos = e.clientY;
      const totalSize = container.clientHeight;
      const pairSum = startRatios[index] + startRatios[index + 1];

      let latestTop = startRatios[index];
      let latestBottom = startRatios[index + 1];

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientY - startPos;
        const deltaRatio = delta / totalSize;
        const topRatio = Math.max(0.1, startRatios[index] + deltaRatio);
        const bottomRatio = Math.max(0.1, startRatios[index + 1] - deltaRatio);
        const newPairSum = topRatio + bottomRatio;
        const scale = pairSum / newPairSum;
        latestTop = topRatio * scale;
        latestBottom = bottomRatio * scale;

        const newRatios = [...startRatios];
        newRatios[index] = latestTop;
        newRatios[index + 1] = latestBottom;

        // Update row flex values directly
        const rowEls = container.querySelectorAll<HTMLElement>('[data-grid-row]');
        if (rowEls[index]) rowEls[index].style.flex = `${latestTop} 1 0%`;
        if (rowEls[index + 1]) rowEls[index + 1].style.flex = `${latestBottom} 1 0%`;
      };

      const onUp = () => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
        grip.releasePointerCapture(e.pointerId);

        const newRatios = [...startRatios];
        newRatios[index] = latestTop;
        newRatios[index + 1] = latestBottom;
        useLayoutStore.setState({ rowRatios: newRatios });
        const s = useLayoutStore.getState();
        window.api.updateSettings({
          panels: s.panels,
          layoutMode,
          panelRatios: s.panelRatios,
          rowRatios: newRatios,
          panelOrder: s.panelOrder,
        });
      };

      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    },
    [layoutMode, rowRatios, rows],
  );

  // ── 1D divider drag (horizontal/vertical) ──
  const handleDividerDrag1D = useCallback(
    (index: number, axis: 'x' | 'y') => (e: React.PointerEvent) => {
      e.preventDefault();
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

        const newRatios = [...startRatios];
        newRatios[index] = latestAdjLeft;
        newRatios[index + 1] = latestAdjRight;

        if (axis === 'x') container.style.gridTemplateColumns = trackStr(newRatios);
        else container.style.gridTemplateRows = trackStr(newRatios);
      };

      const onUp = () => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
        grip.releasePointerCapture(e.pointerId);

        const newRatios = [...startRatios];
        newRatios[index] = latestAdjLeft;
        newRatios[index + 1] = latestAdjRight;
        useLayoutStore.setState({ panelRatios: newRatios });
        const s = useLayoutStore.getState();
        window.api.updateSettings({
          panels: s.panels,
          layoutMode,
          panelRatios: newRatios,
          rowRatios,
          panelOrder: s.panelOrder,
        });
      };

      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    },
    [validRatios, layoutMode, rowRatios],
  );

  // ── Needs padding for settings button ──
  const needsPadding = (vp: number) => {
    if (layoutMode === 'horizontal') return vp === panels.length - 1;
    if (layoutMode === 'vertical') return vp === 0;
    return false;
  };

  // ── Render panel in a row ──
  const renderPanel = (panel: typeof panels[0], si: number, vp: number) => (
    <div
      key={panel.id}
      data-panel
      data-panel-index={si}
      className="flex flex-col min-w-0 min-h-0 overflow-hidden"
      style={getPanelStyle(vp)}
    >
      <PanelView
        panelId={panel.id}
        panelUrl={panel.url}
        needsPadding={needsPadding(vp)}
        index={si}
        onDragStart={handleDragStart}
      />
    </div>
  );

  // ── Render grid-mode content (nested rows) ──
  const renderGridContent = () => {
    const els: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      const rowData = gridRows[r];
      const rawSlice = validRatios.slice(rowData.vpStart, rowData.vpStart + rowData.count);
      const sum = rawSlice.reduce((a, b) => a + b, 0) || 1;
      const rowRatiosSlice = rawSlice.map((r) => r / sum);

      // Row container
      els.push(
        <div
          key={`row-${r}`}
          data-grid-row
          style={{ flex: `${normRowRatios[r] ?? 1 / rows} 1 0%`, width: '100%', minWidth: 0, display: 'grid', gap: 0, gridTemplateColumns: trackStr(rowRatiosSlice), gridTemplateRows: '1fr' }}
        >
          {panels.map((panel, si) => {
            const vp = order[si];
            const row = Math.floor(vp / cols);
            if (row !== r) return null;
            return renderPanel(panel, si, vp);
          })}
          {/* Column dividers */}
          {rowData.count > 1 && Array.from({ length: rowData.count - 1 }, (_, c) => (
            <div
              key={`gh-${r}-${c}`}
              className="relative shrink-0 group w-2 cursor-col-resize"
              style={{ gridColumn: `${2 + c * 2} / ${3 + c * 2}`, gridRow: '1 / 2' }}
              onPointerDown={handleColDividerDrag(r, c)}
            >
              <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
            </div>
          ))}
        </div>,
      );

      // Row divider
      if (r < rows - 1) {
        els.push(
          <div
            key={`gv-${r}`}
            className="relative shrink-0 group h-2 cursor-row-resize"
            onPointerDown={handleRowDividerDrag(r)}
          >
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
          </div>,
        );
      }
    }
    return els;
  };

  // ── Render ──
  const isGrid = layoutMode === 'grid';

  return (
    <div
      ref={containerRef}
      className="flex-1 p-2 overflow-hidden"
      style={containerStyle}
    >
      {isGrid ? renderGridContent() : (
        <>
          {panels.map((panel, i) => {
            const vp = order[i];
            return (
              <div
                key={panel.id}
                data-panel
                data-panel-index={i}
                className="flex min-w-0 min-h-0 overflow-hidden"
                style={layoutMode === 'horizontal'
                  ? { gridColumn: `${1 + vp * 2} / ${2 + vp * 2}`, gridRow: '1 / 2' }
                  : { gridColumn: '1 / 2', gridRow: `${1 + vp * 2} / ${2 + vp * 2}` }
                }
              >
                <PanelView
                  panelId={panel.id}
                  panelUrl={panel.url}
                  needsPadding={needsPadding(vp)}
                  index={i}
                  onDragStart={handleDragStart}
                />
              </div>
            );
          })}

          {/* 1D dividers */}
          {layoutMode === 'horizontal' && panels.length > 1 &&
            Array.from({ length: panels.length - 1 }, (_, i) => (
              <div
                key={`div-${i}`}
                className="relative shrink-0 group w-2 cursor-col-resize"
                style={{ gridColumn: `${2 + i * 2} / ${3 + i * 2}`, gridRow: '1 / 2' }}
                onPointerDown={handleDividerDrag1D(i, 'x')}
              >
                <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
              </div>
            ))}
          {layoutMode === 'vertical' && panels.length > 1 &&
            Array.from({ length: panels.length - 1 }, (_, i) => (
              <div
                key={`div-${i}`}
                className="relative shrink-0 group h-2 cursor-row-resize"
                style={{ gridColumn: '1 / 2', gridRow: `${2 + i * 2} / ${3 + i * 2}` }}
                onPointerDown={handleDividerDrag1D(i, 'y')}
              >
                <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200" />
              </div>
            ))}
        </>
      )}

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
