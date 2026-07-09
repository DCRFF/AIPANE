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
}

function renderUrls() {
  $urls.innerHTML = '';
  panels.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'panel-row';

    // Name row
    const nameRow = document.createElement('div');
    nameRow.className = 'name-row';
    nameRow.innerHTML = `<span class="label">面板 ${i + 1}</span>`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = p.name || '';
    nameInput.style.cssText = 'flex:1;margin:0 4px;font-size:12px;padding:4px 8px';
    nameInput.placeholder = '名称';
    nameInput.addEventListener('change', () => {
      window.api.renamePanel(p.id, nameInput.value.trim());
    });
    nameRow.appendChild(nameInput);
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.style.cssText = 'padding:2px 6px;font-size:12px;background:none;border:none;color:#9ca3af;cursor:pointer';
    removeBtn.disabled = panels.length <= 1;
    removeBtn.addEventListener('click', async () => {
      if (panels.length <= 1) return;
      const s = await window.api.removePanel(p.id);
      panels = s.panels;
      refresh();
    });
    nameRow.appendChild(removeBtn);
    div.appendChild(nameRow);

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = p.url;
    urlInput.addEventListener('change', () => {
      window.api.navigate(p.id, urlInput.value.trim()).then((s) => { panels = s.panels; });
    });
    div.appendChild(urlInput);
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
  panels = s.panels;
  refresh();
});

window.api.getSettings().then((s) => {
  panels = s.panels;
  layoutMode = s.layoutMode;
  refresh();
});
