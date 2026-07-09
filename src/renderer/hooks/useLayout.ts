import { useEffect } from 'react';
import { useLayoutStore } from '../store';

export function useLayout() {
  const panels = useLayoutStore((s) => s.panels);
  const layoutMode = useLayoutStore((s) => s.layoutMode);

  useEffect(() => {
    if (panels.length === 0) return;
    window.api.updateLayout([]);
  }, [panels.length, layoutMode]);
}
