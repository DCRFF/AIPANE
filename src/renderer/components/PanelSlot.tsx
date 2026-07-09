import { useEffect, useRef } from 'react';
import { useLayoutStore } from '../store';

interface Props {
  panelId: string;
}

export default function PanelSlot({ panelId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      window.api.updateLayout([
        {
          id: panelId,
          bounds: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        },
      ]);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [panelId]);

  const index = panels.findIndex((p) => p.id === panelId);
  const ratio = panelRatios[index] ?? 1 / panels.length;

  return (
    <div
      ref={ref}
      className="border border-gray-700 bg-gray-950"
      style={{ flex: ratio }}
    />
  );
}
