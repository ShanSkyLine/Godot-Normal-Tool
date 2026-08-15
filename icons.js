// ════════════════════════════════════════════════════════════
// icons.js — Godot-style flat SVG icon set.
// Replaces the Material Icons font: every <span class="mi">name</span>
// is converted into an inline SVG. A MutationObserver keeps dynamically
// created / retargeted icons (playIco etc.) in sync, so existing JS that
// sets .textContent = 'pause' keeps working unchanged.
// ════════════════════════════════════════════════════════════

const _S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const _F = 'fill="currentColor" stroke="none"';

const ICONS = {
  // generation / tools
  blur_on:        `<circle cx="8" cy="8" r="2.4" ${_F}/><circle cx="8" cy="2.4" r="1.1" ${_F}/><circle cx="8" cy="13.6" r="1.1" ${_F}/><circle cx="2.4" cy="8" r="1.1" ${_F}/><circle cx="13.6" cy="8" r="1.1" ${_F}/><circle cx="4" cy="4" r=".9" ${_F} opacity=".6"/><circle cx="12" cy="4" r=".9" ${_F} opacity=".6"/><circle cx="4" cy="12" r=".9" ${_F} opacity=".6"/><circle cx="12" cy="12" r=".9" ${_F} opacity=".6"/>`,
  format_color_fill: `<path d="M7.2 1.6 12.9 7.3a1 1 0 0 1 0 1.4l-3.6 3.6a2 2 0 0 1-2.8 0L3.2 9a2 2 0 0 1 0-2.8L6.6 2.8" ${_S}/><path d="M13.6 11.2s1.4 1.7 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-.9 1.4-2.6 1.4-2.6z" ${_F}/>`,
  auto_awesome:   `<path d="M8 2.2 9.5 6.5 13.8 8 9.5 9.5 8 13.8 6.5 9.5 2.2 8 6.5 6.5Z" ${_F}/><circle cx="13" cy="3" r="1.1" ${_F} opacity=".7"/>`,
  tune:           `<path d="M2 4.5h6M11.5 4.5H14M2 11.5h2.5M8 11.5h6" ${_S}/><circle cx="9.8" cy="4.5" r="1.8" ${_S}/><circle cx="6.2" cy="11.5" r="1.8" ${_S}/>`,
  restart_alt:    `<path d="M8 3a5 5 0 1 1-4.7 3.3" ${_S}/><path d="M3 2v4h4" ${_S}/>`,
  imagesearch_roller: `<rect x="3" y="2" width="10" height="3.6" rx="1" ${_S}/><path d="M13 3.8h1.4v3.4H8.6v2" ${_S}/><rect x="7.2" y="9.2" width="2.8" height="4.6" rx=".8" ${_F}/>`,
  texture:        `<rect x="2" y="2" width="12" height="12" rx="1.5" ${_S}/><path d="M2.5 10.5 10.5 2.5M5.5 13.5 13.5 5.5" ${_S} opacity=".75"/>`,
  person:         `<circle cx="8" cy="5" r="2.7" ${_S}/><path d="M2.8 13.6c.6-2.9 2.7-4.3 5.2-4.3s4.6 1.4 5.2 4.3" ${_S}/>`,
  // views / viewport
  compare:        `<rect x="2" y="3" width="5.2" height="10" rx="1" ${_F} opacity=".85"/><rect x="8.8" y="3" width="5.2" height="10" rx="1" ${_S}/>`,
  image:          `<rect x="2" y="2.6" width="12" height="10.8" rx="1.4" ${_S}/><circle cx="5.6" cy="6" r="1.2" ${_F}/><path d="M3 12l3.4-3.6 2.4 2.4 2.2-2.6L14 12" ${_S}/>`,
  highlight:      `<path d="M8 1.6v2M3.5 3.5l1.4 1.4M12.5 3.5l-1.4 1.4M1.6 8h2M12.4 8h2" ${_S}/><path d="M5.4 9.4a3.2 3.2 0 1 1 5.2 0l-.8 1.2H6.2Z" ${_F}/><path d="M6.4 12.4h3.2M7 14.2h2" ${_S}/>`,
  blur_circular:  `<circle cx="8" cy="8" r="6" ${_S}/><circle cx="8" cy="8" r="1.6" ${_F}/><circle cx="8" cy="4.8" r=".8" ${_F} opacity=".7"/><circle cx="8" cy="11.2" r=".8" ${_F} opacity=".7"/><circle cx="4.8" cy="8" r=".8" ${_F} opacity=".7"/><circle cx="11.2" cy="8" r=".8" ${_F} opacity=".7"/>`,
  // zoom
  add:            `<path d="M8 3v10M3 8h10" ${_S}/>`,
  remove:         `<path d="M3 8h10" ${_S}/>`,
  fit_screen:     `<path d="M2 5.5V3.5A1.5 1.5 0 0 1 3.5 2h2M10.5 2h2A1.5 1.5 0 0 1 14 3.5v2M14 10.5v2a1.5 1.5 0 0 1-1.5 1.5h-2M5.5 14h-2A1.5 1.5 0 0 1 2 12.5v-2" ${_S}/><rect x="5.4" y="5.4" width="5.2" height="5.2" rx=".8" ${_F} opacity=".8"/>`,
  crop_free:      `<path d="M2 5.5V3.5A1.5 1.5 0 0 1 3.5 2h2M10.5 2h2A1.5 1.5 0 0 1 14 3.5v2M14 10.5v2a1.5 1.5 0 0 1-1.5 1.5h-2M5.5 14h-2A1.5 1.5 0 0 1 2 12.5v-2" ${_S}/>`,
  // input / files
  upload_file:    `<path d="M9.4 1.8H4.6A1.4 1.4 0 0 0 3.2 3.2v9.6a1.4 1.4 0 0 0 1.4 1.4h6.8a1.4 1.4 0 0 0 1.4-1.4V5.2Z" ${_S}/><path d="M9.4 1.8v3.4h3.4" ${_S}/><path d="M8 11.4V7.6M6.4 9.2 8 7.6l1.6 1.6" ${_S}/>`,
  grid_on:        `<rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1.2" ${_S}/><path d="M2.2 6.1h11.6M2.2 9.9h11.6M6.1 2.2v11.6M9.9 2.2v11.6" ${_S} stroke-width="1.2"/>`,
  grid_view:      `<rect x="2.2" y="2.2" width="4.8" height="4.8" rx="1" ${_F}/><rect x="9" y="2.2" width="4.8" height="4.8" rx="1" ${_S}/><rect x="2.2" y="9" width="4.8" height="4.8" rx="1" ${_S}/><rect x="9" y="9" width="4.8" height="4.8" rx="1" ${_F} opacity=".7"/>`,
  layers:         `<path d="M8 1.8 14 5 8 8.2 2 5Z" ${_F}/><path d="m2.6 8.2 5.4 2.9 5.4-2.9" ${_S}/><path d="m2.6 11 5.4 2.9 5.4-2.9" ${_S} opacity=".65"/>`,
  add_photo_alternate: `<path d="M13.8 7v4.4a2.4 2.4 0 0 1-2.4 2.4H4.6a2.4 2.4 0 0 1-2.4-2.4V4.6a2.4 2.4 0 0 1 2.4-2.4H9" ${_S}/><path d="M12.4 1.4v4M10.4 3.4h4" ${_S}/><circle cx="5.6" cy="6.4" r="1.1" ${_F}/><path d="M3 11.6l2.8-3 2.2 2.2 1.8-2.2 3.4 3.4" ${_S}/>`,
  film:           `<rect x="2" y="3" width="12" height="10" rx="1.4" ${_S}/><path d="M4.8 3v10M11.2 3v10" ${_S} stroke-width="1.2"/><path d="M2 6.3h2.8M2 9.7h2.8M11.2 6.3H14M11.2 9.7H14" ${_S} stroke-width="1.2"/>`,
  // lights
  wb_incandescent:`<path d="M8 1.6v1.6M2.9 3.6l1.2 1.2M13.1 3.6l-1.2 1.2M1.6 8.6h1.6M12.8 8.6h1.6" ${_S}/><path d="M8 4.6a3.6 3.6 0 0 1 2 6.6v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1a3.6 3.6 0 0 1 2-6.6z" ${_F}/>`,
  // export
  download:       `<path d="M8 2.2v7.2M5.2 6.6 8 9.4l2.8-2.8" ${_S}/><path d="M2.6 10.8v1.6a1.4 1.4 0 0 0 1.4 1.4h8a1.4 1.4 0 0 0 1.4-1.4v-1.6" ${_S}/>`,
  folder_zip:     `<path d="M2 4.2A1.4 1.4 0 0 1 3.4 2.8h2.8L7.6 4.4h5A1.4 1.4 0 0 1 14 5.8v6a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 11.8Z" ${_S}/><path d="M10.6 4.6v1.4h1.4v1.4h-1.4v1.4h1.4v1.4h-1.4V13" ${_S} stroke-width="1.2"/>`,
  inventory_2:    `<rect x="2.2" y="2.4" width="11.6" height="3.4" rx=".9" ${_F}/><path d="M3 6.2v6a1.6 1.6 0 0 0 1.6 1.6h6.8A1.6 1.6 0 0 0 13 12.2v-6" ${_S}/><path d="M6.4 8.8h3.2" ${_S}/>`,
  code:           `<path d="m5.4 5-3 3 3 3M10.6 5l3 3-3 3" ${_S}/><path d="M9 3.6 7 12.4" ${_S} opacity=".7"/>`,
  settings_applications: `<rect x="2" y="2" width="12" height="12" rx="2" ${_S}/><circle cx="8" cy="8" r="1.5" ${_F}/><path d="M8 4.6v1M8 10.4v1M4.6 8h1M10.4 8h1M5.6 5.6l.7.7M9.7 9.7l.7.7M10.4 5.6l-.7.7M6.3 9.7l-.7.7" ${_S} stroke-width="1.2"/>`,
  dashboard:      `<rect x="2.2" y="2.2" width="5" height="7" rx="1" ${_F}/><rect x="8.8" y="2.2" width="5" height="4" rx="1" ${_S}/><rect x="8.8" y="7.8" width="5" height="6" rx="1" ${_F} opacity=".75"/><rect x="2.2" y="10.8" width="5" height="3" rx="1" ${_S}/>`,
  // misc UI
  close:          `<path d="M4 4l8 8M12 4l-8 8" ${_S}/>`,
  check:          `<path d="M3 8.6 6.4 12 13 4.6" ${_S}/>`,
  help_outline:   `<circle cx="8" cy="8" r="6" ${_S}/><path d="M6.2 6.2A1.9 1.9 0 1 1 8 8.5v1" ${_S}/><circle cx="8" cy="11.6" r=".9" ${_F}/>`,
  info_outline:   `<circle cx="8" cy="8" r="6" ${_S}/><path d="M8 7.4v3.8" ${_S}/><circle cx="8" cy="5" r=".9" ${_F}/>`,
  history:        `<path d="M8 3a5 5 0 1 1-4.9 4" ${_S}/><path d="M3.2 3v3h3" ${_S}/><path d="M8 5.6V8l2 1.6" ${_S}/>`,
  school:         `<path d="M8 2.6 14.4 6 8 9.4 1.6 6Z" ${_F}/><path d="M4 8v3c0 1 1.8 2.2 4 2.2s4-1.2 4-2.2V8" ${_S}/><path d="M14.4 6v3.6" ${_S}/>`,
  // playback / capture
  play_arrow:     `<path d="M5 3.2c0-.7.8-1.1 1.4-.8l6.2 4.1c.6.4.6 1.3 0 1.6l-6.2 4.2c-.6.4-1.4 0-1.4-.8Z" ${_F}/>`,
  pause:          `<rect x="3.8" y="3" width="3" height="10" rx="1" ${_F}/><rect x="9.2" y="3" width="3" height="10" rx="1" ${_F}/>`,
  stop:           `<rect x="3.4" y="3.4" width="9.2" height="9.2" rx="1.4" ${_F}/>`,
  videocam:       `<rect x="1.8" y="4" width="8.6" height="8" rx="1.4" ${_S}/><path d="M10.4 7.2 14 5v6l-3.6-2.2" ${_F}/>`,
  // spin
  '360':          `<path d="M8 3.2c3.9 0 6.6 1.6 6.6 3.4 0 1.5-1.9 2.8-4.6 3.2" ${_S}/><path d="M8 3.2C4.1 3.2 1.4 4.8 1.4 6.6c0 1.7 2.4 3.1 5.6 3.4" ${_S}/><path d="m8.6 7.6 2.6 2.2-2.6 2.2" ${_S}/><circle cx="8" cy="12.8" r="1.2" ${_F} opacity=".7"/>`,
};

function _iconNode(name){
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('gi');
  svg.innerHTML = ICONS[name];
  return svg;
}
function renderIcon(el){
  let name = el.textContent.trim();
  if (!name && el.dataset.ico) name = el.dataset.ico;
  if (!ICONS[name]) return;                                   // unknown → leave as-is
  if (el.dataset.ico === name && el.querySelector('svg')) return; // already rendered
  el.dataset.ico = name;
  el.textContent = '';
  el.appendChild(_iconNode(name));
}
function renderAllIcons(root){
  (root || document).querySelectorAll('.mi').forEach(renderIcon);
}

// Watch for dynamically inserted icons AND textContent changes on existing
// ones (e.g. playIco.textContent = 'pause'). Re-render sets innerHTML which
// re-triggers the observer, but renderIcon() bails out when the icon is
// already correct, so there is no loop.
const _iconObserver = new MutationObserver(muts => {
  for (const m of muts){
    let t = m.target;
    if (t.nodeType === 3) t = t.parentElement;
    if (!t) continue;
    if (t.classList && t.classList.contains('mi')) renderIcon(t);
    if (t.querySelectorAll) t.querySelectorAll('.mi').forEach(renderIcon);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  renderAllIcons();
  _iconObserver.observe(document.body, { childList:true, subtree:true, characterData:true });
});
