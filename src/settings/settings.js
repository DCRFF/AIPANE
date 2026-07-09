let panels = [];
let layoutDirection = 'horizontal';

const $count = document.getElementById('count');
const $urls = document.getElementById('urls');
const $layoutBtn = document.getElementById('layoutBtn');

async function refresh() {
  $count.textContent = panels.length;
  $layoutBtn.textContent = layoutDirection === 'horizontal' ? '横向 → 纵向' : '纵向 → 横向';
  renderUrls();
  document.getElementById('addBtn').disabled = panels.length >= 5;
  document.getElementById('removeBtn').disabled = panels.length <= 2;
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
        p.url = input.value.trim();
      });
    });
    div.appendChild(input);
    $urls.appendChild(div);
  });
}

document.getElementById('closeBtn').addEventListener('click', () => {
  window.api.closeSettings();
});

document.getElementById('addBtn').addEventListener('click', async () => {
  if (panels.length >= 5) return;
  const s = await window.api.addPanel('https://chat.deepseek.com/');
  panels = s.panels;
  refresh();
});

document.getElementById('removeBtn').addEventListener('click', async () => {
  if (panels.length <= 2) return;
  const s = await window.api.removePanel(panels[panels.length - 1].id);
  panels = s.panels;
  refresh();
});

document.getElementById('layoutBtn').addEventListener('click', async () => {
  const newDir = layoutDirection === 'horizontal' ? 'vertical' : 'horizontal';
  await window.api.updateSettings({ panels, layoutDirection: newDir, panelRatios: panels.map(() => 1 / panels.length) });
  layoutDirection = newDir;
  refresh();
});

// init
window.api.getSettings().then((s) => {
  panels = s.panels;
  layoutDirection = s.layoutDirection;
  refresh();
});
