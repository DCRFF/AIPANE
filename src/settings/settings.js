let panels = [];
let layoutMode = 'horizontal';

const LAYOUT_MODES = [
  { value: 'horizontal', label: '横向' },
  { value: 'vertical', label: '纵向' },
  { value: 'grid', label: '田字' },
];

const $count = document.getElementById('count');
const $urls = document.getElementById('urls');
const $layoutBtns = document.getElementById('layoutBtns');

async function refresh() {
  $count.textContent = panels.length;
  renderUrls();
  renderLayoutBtns();
  document.getElementById('addBtn').disabled = panels.length >= 6;
  document.getElementById('removeBtn').disabled = panels.length <= 1;
}

function renderUrls() {
  $urls.innerHTML = '';
  panels.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'panel-row';
    div.innerHTML = `<div class="label">面板 ${i + 1}</div>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = p.url;
    input.addEventListener('change', () => {
      window.api.navigate(p.id, input.value.trim()).then((s) => {
        panels = s.panels;
      });
    });
    div.appendChild(input);
    $urls.appendChild(div);
  });
}

function renderLayoutBtns() {
  $layoutBtns.innerHTML = '';
  LAYOUT_MODES.forEach((m) => {
    const btn = document.createElement('button');
    btn.className = 'btn' + (layoutMode === m.value ? ' active' : '');
    btn.textContent = m.label;
    btn.addEventListener('click', async () => {
      await window.api.updateSettings({ panels, layoutMode: m.value, panelRatios: panels.map(() => 1 / panels.length) });
      layoutMode = m.value;
      refresh();
    });
    $layoutBtns.appendChild(btn);
  });
}

document.getElementById('closeBtn').addEventListener('click', () => {
  window.api.closeSettings();
});

document.getElementById('addBtn').addEventListener('click', async () => {
  if (panels.length >= 6) return;
  const s = await window.api.addPanel('about:blank');
  refresh();
});

document.getElementById('removeBtn').addEventListener('click', async () => {
  if (panels.length <= 1) return;
  const s = await window.api.removePanel(panels[panels.length - 1].id);
  panels = s.panels;
  refresh();
});

window.api.getSettings().then((s) => {
  panels = s.panels;
  layoutMode = s.layoutMode;
  refresh();
});
