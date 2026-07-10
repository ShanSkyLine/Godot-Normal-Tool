// ════════════════════════════════════════════════════════════
// i18n.js — RU / EN localization
// Auto-detects browser language; switchable via button. Persisted.
// ════════════════════════════════════════════════════════════

const I18N = {
  en: {
    lang_name:'EN',
    engine:'Engine', eng_classic:'Classic',
    tip_xdetail:'<b>Detail</b> — weight of the fine gradient octave. Fine surface texture.',
    tip_xvolume:'<b>Volume</b> — weight of the coarse octave. Big smooth forms.',
    tip_xshape:'<b>Shape</b> — adds a soft dome from the sprite silhouette. Body roundness.',
    tip_xsmooth:'<b>Smooth</b> — final normal-field smoothing. Rounds harsh angles.',
    tip_xcrisp:'<b>Micro contrast</b> — sharpens fine surface texture back up after smoothing.',
    presets:'Presets', preset_applied:'Preset applied',

    subtitle:'normal map generator for Godot 4',
    tab_generate:'Generate', tab_fill:'Fill',
    tutorial:'Tutorial',
    input_mode:'Input mode', single:'Single', sheet:'Sheet', frames:'Frames',
    layers_sec:'Layers', no_layers:'No layers yet — add one below.', no_visible_layers:'All layers hidden',
    layers_hint:'Add several images as layers, then drag them right on the preview to position — or type exact X/Y below. Each gets its own normal map; tap a layer to preview it alone, or view them blended together.',
    add_layer:'Add layer', visible:'Visible', combined:'combined', processing:'Processing…', ready:'Ready',
    drop_main:'Drop or click', drop_sub:'PNG · WebP · alpha OK',
    spritesheet:'Spritesheet', columns:'Columns', rows:'Rows', start:'Start',
    generation:'Generation', strength:'Strength', level:'Level',
    blur_sharp:'Blur / Sharp', z_range:'Z Range', filter:'Filter', invert:'Invert',
    reset_defaults:'Reset defaults',
    ao:'Ambient Occlusion', radius:'Radius', generate_ao:'Generate AO', export_ao:'Export AO map',
    custom_normal:'Custom normal', custom_normal_hint:'Load your own normal map to preview lit on the sprite.',
    load_normal:'Load normal map', use_generated:'Use generated',
    lights:'Lights', add_light:'Add light',
    export:'Export', normal_png:'Normal map PNG', current_frame:'Current frame',
    normal_sheet:'Normal spritesheet', same_grid:'Same grid', all_frames:'All frames',
    individual_pngs:'Individual PNGs', godot_snippet:'Godot 4 snippet',
    godot_pkg:'Godot package', godot_pkg_desc:'Sprite + normal map + import + lights script',
    godot_pkg_building:'Building Godot package…', godot_pkg_done:'Godot package downloaded — see README',
    godot_import:'Godot .import file', import_desc:'Ready-to-use import config', copy:'Copy',
    tilesheet:'Tilesheet (custom grid)', tilesheet_desc:'Pack frames into tiles',
    info:'Info', no_image:'No image loaded.',
    view_split:'Split', view_orig:'Orig', view_normal:'Normal', view_lit:'Lit',
    nav_input:'Input', nav_adjust:'Adjust', nav_ao:'AO', nav_lights:'Lights', nav_export:'Export',
    // tooltips
    tip_str:'<b>Strength</b> — how steep the gradients appear. Higher = more pronounced bumps.',
    tip_level:'<b>Level</b> — sampling distance. High = broad smooth forms; Low = fine detail.',
    tip_blur:'<b>Blur/Sharp</b> — pre-blur before generating. Smooths noisy sprites.',
    tip_z:'<b>Z Range</b> — surface depth. Lower = flatter; higher = more rounded.',
    tip_ao:'<b>AO Radius</b> — how far ambient occlusion spreads into crevices.',
    tip_aostr:'<b>AO Strength</b> — darkness of shadows in occluded areas.',
    // toasts
    keep_one_light:'Keep at least one light', generate_first:'Generate first',
    saved:'Saved', saved_sheet:'Saved spritesheet', all_saved:'All frames saved',
    load_sprite_first:'Load a sprite first', copied_snippet:'Copied Godot snippet',
    copied_import:'Copied .import config', copy_failed:'Copy failed',
    ao_ready:'AO map generated', ao_saved:'AO map saved',
    custom_loaded:'Custom normal loaded — showing lit preview', back_generated:'Back to generated normal map',
    reset_done:'Reset to defaults', fill_applied:'Fill applied as normal map', fill_saved:'Fill downloaded',
    loaded_current:'Loaded current sprite', loaded_recent:'Loaded from recent',
    png_saved:'PNG saved (500×500)', video_saved:'Video saved (WebM)',
    video_unsupported:'Video capture not supported here', max_lights:'Max 4 lights',
    no_recent:'No recent normals yet. Generate one first.',
    tile_prompt:'Tiles per row?',
    // tutorial
    tut_skip:'Skip tutorial', tut_back:'← Back', tut_next:'Next →', tut_start:'Get started',
    tut_getting_started:'Getting started',
  },
  ru: {
    lang_name:'RU',
    engine:'Движок', eng_classic:'Классика',
    tip_xdetail:'<b>Детали</b> — вес мелкой октавы градиента. Тонкая фактура поверхности.',
    tip_xvolume:'<b>Объём</b> — вес крупной октавы. Большие гладкие формы.',
    tip_xshape:'<b>Форма</b> — мягкий купол от силуэта спрайта. Округлость тела.',
    tip_xsmooth:'<b>Сглаживание</b> — финальное сглаживание нормалей. Скругляет углы.',
    tip_xcrisp:'<b>Микро-контраст</b> — возвращает резкость мелкой текстуре после сглаживания.',
    presets:'Пресеты', preset_applied:'Пресет применён',

    subtitle:'генератор карт нормалей для Godot 4',
    tab_generate:'Генерация', tab_fill:'Заливка',
    tutorial:'Обучение',
    input_mode:'Режим ввода', single:'Один', sheet:'Лист', frames:'Кадры',
    layers_sec:'Слои', no_layers:'Слоёв пока нет — добавь ниже.', no_visible_layers:'Все слои скрыты',
    layers_hint:'Добавь несколько изображений как слои и перетаскивай их прямо по превью — или впиши точные X/Y ниже. У каждого своя карта нормалей — нажми на слой для просмотра отдельно или смотри всё вместе.',
    add_layer:'Добавить слой', visible:'Видимый', combined:'вместе', processing:'Обработка…', ready:'Готово',
    drop_main:'Перетащи или нажми', drop_sub:'PNG · WebP · с альфой',
    spritesheet:'Спрайтшит', columns:'Столбцы', rows:'Строки', start:'Старт',
    generation:'Генерация', strength:'Сила', level:'Уровень',
    blur_sharp:'Блюр / Резкость', z_range:'Z-глубина', filter:'Фильтр', invert:'Инверсия',
    reset_defaults:'Сбросить',
    ao:'Ambient Occlusion', radius:'Радиус', generate_ao:'Создать AO', export_ao:'Скачать AO',
    custom_normal:'Своя нормаль', custom_normal_hint:'Загрузи свою карту нормалей для предпросмотра с освещением.',
    load_normal:'Загрузить нормаль', use_generated:'Вернуть свою',
    lights:'Освещение', add_light:'Добавить свет',
    export:'Экспорт', normal_png:'Карта нормалей PNG', current_frame:'Текущий кадр',
    normal_sheet:'Спрайтшит нормалей', same_grid:'Та же сетка', all_frames:'Все кадры',
    individual_pngs:'Отдельные PNG', godot_snippet:'Сниппет Godot 4',
    godot_pkg:'Пакет для Godot', godot_pkg_desc:'Спрайт + нормаль + import + скрипт света',
    godot_pkg_building:'Собираю пакет для Godot…', godot_pkg_done:'Пакет для Godot скачан — см. README',
    godot_import:'Файл .import для Godot', import_desc:'Готовый конфиг импорта', copy:'Копировать',
    tilesheet:'Тайлшит (своя сетка)', tilesheet_desc:'Упаковать кадры в тайлы',
    info:'Инфо', no_image:'Изображение не загружено.',
    view_split:'Сплит', view_orig:'Ориг.', view_normal:'Нормаль', view_lit:'Свет',
    nav_input:'Ввод', nav_adjust:'Настр.', nav_ao:'AO', nav_lights:'Свет', nav_export:'Экспорт',
    tip_str:'<b>Сила</b> — насколько крутыми выглядят градиенты. Больше = выраженный рельеф.',
    tip_level:'<b>Уровень</b> — дистанция семплинга. Высокий = крупные формы; низкий = мелкие детали.',
    tip_blur:'<b>Блюр/Резкость</b> — предварительное сглаживание. Убирает шум со спрайта.',
    tip_z:'<b>Z-глубина</b> — глубина поверхности. Ниже = площе; выше = более округло.',
    tip_ao:'<b>Радиус AO</b> — как далеко окклюзия проникает в углубления.',
    tip_aostr:'<b>Сила AO</b> — насколько тёмные тени в затенённых местах.',
    keep_one_light:'Оставь хотя бы один источник', generate_first:'Сначала сгенерируй',
    saved:'Сохранено', saved_sheet:'Спрайтшит сохранён', all_saved:'Все кадры сохранены',
    load_sprite_first:'Сначала загрузи спрайт', copied_snippet:'Сниппет Godot скопирован',
    copied_import:'Конфиг .import скопирован', copy_failed:'Не удалось скопировать',
    ao_ready:'AO-карта создана', ao_saved:'AO-карта сохранена',
    custom_loaded:'Своя нормаль загружена — показываю с освещением', back_generated:'Вернулись к сгенерированной нормали',
    reset_done:'Сброшено к стандартным', fill_applied:'Заливка применена', fill_saved:'Заливка скачана',
    loaded_current:'Текущий спрайт загружен', loaded_recent:'Загружено из недавних',
    png_saved:'PNG сохранён (500×500)', video_saved:'Видео сохранено (WebM)',
    video_unsupported:'Запись видео не поддерживается', max_lights:'Максимум 4 источника',
    no_recent:'Пока нет недавних нормалей. Сгенерируй одну.',
    tile_prompt:'Тайлов в ряду?',
    tut_skip:'Пропустить', tut_back:'← Назад', tut_next:'Далее →', tut_start:'Начать',
    tut_getting_started:'С чего начать',
  }
};

const TUT_STEPS_I18N = {
  en: [
    {icon:'⬡',title:'Welcome to Normal-Godot β',text:'This tool generates <b>normal maps</b> for 2D sprites — perfect for Godot 4.x dynamic lighting. Takes ~30 seconds to learn.'},
    {icon:'🖼',title:'Load a sprite',text:'Drag & drop a PNG, or tap to browse. Supports single sprites, <b>spritesheets</b> (auto-sliced), or <b>multiple frames</b> at once.'},
    {icon:'⚙️',title:'Adjust settings',text:'<b>Strength</b> = relief amount.<br><b>Level</b> = detail scale.<br><b>Blur</b> = smooth noise.<br><b>Z Range</b> = depth.<br>Hover <b>ⓘ</b> for tips.'},
    {icon:'💡',title:'Multi-light preview',text:'Add coloured lights in the right panel. Drag the <b>light pad</b> to set direction. See it in the <b>Lit</b> view.'},
    {icon:'🗂',title:'Layers',text:'Switch input mode to <b>Layers</b> to stack multiple images. Each gets its own normal map — tap a layer to preview it alone, or view them blended together.'},
    {icon:'📦',title:'Export for Godot',text:'Use <b>Godot package</b> for a ready-to-drop-in bundle (sprite + normal map + import files + lights script), or copy the <b>.import</b> config / GDScript snippet directly.'},
  ],
  ru: [
    {icon:'⬡',title:'Добро пожаловать в Normal-Godot β',text:'Этот инструмент создаёт <b>карты нормалей</b> для 2D-спрайтов — идеально для динамического света в Godot 4.x. Освоить можно за ~30 секунд.'},
    {icon:'🖼',title:'Загрузи спрайт',text:'Перетащи PNG или нажми для выбора. Поддерживает одиночные спрайты, <b>спрайтшиты</b> (авто-нарезка) или <b>несколько кадров</b> сразу.'},
    {icon:'⚙️',title:'Настрой параметры',text:'<b>Сила</b> = величина рельефа.<br><b>Уровень</b> = масштаб деталей.<br><b>Блюр</b> = сглаживание.<br><b>Z-глубина</b> = глубина.<br>Наведи на <b>ⓘ</b> для подсказок.'},
    {icon:'💡',title:'Превью с освещением',text:'Добавь цветные источники в правой панели. Тяни <b>площадку света</b> для направления. Смотри в режиме <b>Свет</b>.'},
    {icon:'🗂',title:'Слои',text:'Переключи режим ввода на <b>Слои</b>, чтобы собрать несколько изображений. У каждого своя карта нормалей — нажми на слой для просмотра отдельно или смотри всё вместе.'},
    {icon:'📦',title:'Экспорт для Godot',text:'Используй <b>Пакет для Godot</b> — готовый набор файлов (спрайт + нормаль + import + скрипт света), или скопируй <b>.import</b> конфиг / сниппет GDScript напрямую.'},
  ]
};

let curLang = 'en';
function detectLang(){
  try {
    const saved = localStorage.getItem('ng_lang');
    if (saved && I18N[saved]) return saved;
  } catch(e){}
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('ru') ? 'ru' : 'en';
}
function t(key){ return (I18N[curLang] && I18N[curLang][key]) || I18N.en[key] || key; }
function setLang(lang){
  curLang = I18N[lang] ? lang : 'en';
  try { localStorage.setItem('ng_lang', curLang); } catch(e){}
  applyI18n();
  const btn = $('langBtn'); if (btn) btn.textContent = curLang === 'en' ? 'RU' : 'EN';
}
function toggleLang(){ setLang(curLang === 'en' ? 'ru' : 'en'); }

// Apply translations to all [data-i18n] elements
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const txt = t(key);
    // preserve leading icon span if present
    const icon = el.querySelector('.mi');
    if (icon){ el.innerHTML = icon.outerHTML + ' ' + txt; }
    else el.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  // tooltips dict refresh
  if (typeof refreshTips === 'function') refreshTips();
  // re-render tutorial if open
  if (typeof renderTutStep === 'function' && $('tutModal') && $('tutModal').classList.contains('open')) renderTutStep();
}
