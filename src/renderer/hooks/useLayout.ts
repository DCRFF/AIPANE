import { useEffect } from 'react';
import { useLayoutStore } from '../store';

export function useLayout() {
  const panels = useLayoutStore((s) => s.panels);
  const panelRatios = useLayoutStore((s) => s.panelRatios);
  const layoutDirection = useLayoutStore((s) => s.layoutDirection);

  useEffect(() => {
    if (panels.length === 0) return;

    // 通知主进程重新布局（使用当前比例）
    const items = panels.map((panel, i) => ({
      id: panel.id,
      bounds: { x: 0, y: 0, width: 0, height: 0 }, // 主进程根据 panelRatios 计算
    }));
    window.api.updateLayout(items);
  }, [panels.length, layoutDirection]);
}
