import React, { useRef } from 'react';

interface Props {
  direction: 'horizontal' | 'vertical';
  ratios: number[];
  onRatiosChange: (ratios: number[]) => void;
  children: React.ReactNode[];
}

export default function SplitPane({ direction, ratios, onRatiosChange, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const axis = direction === 'horizontal' ? 'x' : 'y';

  const handleDrag = (index: number) => (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const grip = e.currentTarget as HTMLElement;
    grip.setPointerCapture(e.pointerId);

    const startRatios = [...ratios];
    const startPos = axis === 'x' ? e.clientX : e.clientY;
    const totalSize = axis === 'x' ? container.clientWidth : container.clientHeight;
    const pairSum = startRatios[index] + startRatios[index + 1];

    const onMove = (ev: PointerEvent) => {
      const currentPos = axis === 'x' ? ev.clientX : ev.clientY;
      const delta = currentPos - startPos;
      const deltaRatio = delta / totalSize;
      const leftRatio = Math.max(0.1, startRatios[index] + deltaRatio);
      const rightRatio = Math.max(0.1, startRatios[index + 1] - deltaRatio);
      const newPairSum = leftRatio + rightRatio;
      const scale = pairSum / newPairSum;
      const adjLeft = leftRatio * scale;
      const adjRight = rightRatio * scale;

      for (let i = 0; i < children.length; i++) {
        const el = container.children[i * 2] as HTMLElement;
        if (i === index) el.style.flex = `${adjLeft}`;
        else if (i === index + 1) el.style.flex = `${adjRight}`;
        else el.style.flex = `${startRatios[i]}`;
      }
    };

    const onUp = () => {
      grip.removeEventListener('pointermove', onMove);
      grip.removeEventListener('pointerup', onUp);
      grip.releasePointerCapture(e.pointerId);

      const newRatios: number[] = [];
      let sum = 0;
      for (let i = 0; i < children.length; i++) {
        const el = container.children[i * 2] as HTMLElement;
        const val = parseFloat(el.style.flex) || ratios[i];
        newRatios.push(val);
        sum += val;
        el.style.flex = '';
      }
      if (sum > 0 && Math.abs(sum - 1) > 0.001) {
        // re-normalize
        for (let i = 0; i < newRatios.length; i++) newRatios[i] /= sum;
      }
      onRatiosChange(newRatios);
    };

    grip.addEventListener('pointermove', onMove);
    grip.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={containerRef}
      className="flex"
      style={{
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: 0,
        flex: 1,
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {children.map((child, i) => (
        <React.Fragment key={i}>
          <div style={{ flex: ratios[i], display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            {child}
          </div>
          {i < children.length - 1 && (
            <div
              className={`relative shrink-0 group ${
                direction === 'horizontal' ? 'w-2 cursor-col-resize' : 'h-2 cursor-row-resize'
              }`}
              onPointerDown={handleDrag(i)}
            >
              <div
                className={`absolute rounded-full bg-transparent group-hover:bg-blue-500/40 transition-colors duration-200 ${
                  direction === 'horizontal'
                    ? 'inset-y-1 left-1/2 -translate-x-1/2 w-[3px]'
                    : 'inset-x-1 top-1/2 -translate-y-1/2 h-[3px]'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
