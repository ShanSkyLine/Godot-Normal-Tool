// ════════════════════════════════════════════════════════════
// i18n.js — RU / EN localization
// Auto-detects browser language; switchable via button. Persisted.
// ════════════════════════════════════════════════════════════

const I18N = {
  en: {
    lang_name:'EN',
    engine:'Engine', eng_classic:'Classic', eng_x:'Experimental',
    tip_xdetail:'<b>Detail</b> — weight of the fine gradient octave. Fine surface texture.',
    tip_xvolume:'<b>Volume</b> — weight of the coarse octave. Big smooth forms.',
    tip_xshape:'<b>Shape</b> — adds a soft dome from the sprite silhouette. Body roundness.',
    tip_xsmooth:'<b>Smooth</b> — final normal-field smoothing. Rounds harsh angles.',
    tip_xcrisp:'<b>Micro contrast</b> — sharpens fine surface texture back up after smoothing.',
    presets:'Presets', preset_applied:'Preset applied',
    x_target:'Target', x_sprite:'Sprite', x_texture:'Texture',
    x_sprite_hint:'Sprite: for game assets with transparency — swords, characters, items. Silhouette-aware, no edge halo, optional body dome.',
    x_texture_hint:'Texture: for tileable materials — stone, wood, fabric. Alpha is ignored; with Seamless on, edges wrap so the map tiles without seams.',
    x_seamless:'Seamless (tileable)',
    tip_xseam:'<b>Seamless</b> — convolutions wrap around the edges so the exported normal map tiles cleanly.',
    tab_spin:'Spin',
    spin_source:'Source', spin_use_current:'Use current result', spin_from_recent:'From recent',
    spin_sprite:'Sprite', spin_normal:'Normal', spin_motion:'Motion',
    spin_obj:'Object spins', spin_light:'Lights orbit', spin_speed:'Speed',
    spin_center:'Rotation center', spin_auto:'Auto', spin_manual:'Manual',
    spin_pick_hint:'Tap the preview to place the rotation pivot.',
    spin_bg:'Background', spin_bg_color:'Color', spin_transparent:'Transparent',
    spin_png:'PNG frame (500×500)', spin_dur:'Duration s', spin_record:'Record video',
    spin_close:'Close Spin', spin_orbit:'Orbit', spin_mirror:'Mirror', spin_drag_position:'Drag to set<br>light position', light_label:'Light', recent_normals:'Recent normals', layers_tab:'Layers',

    subtitle:'normal map generator for Godot 4',
    tab_generate:'Generate', tab_fill:'Fill',
    tutorial:'Tutorial',
    input_mode:'Input mode', single:'Single', sheet:'Sheet', frames:'Frames',
    layers_sec:'Sprites', no_layers:'No layers yet — add one below.', no_visible_layers:'All layers hidden',
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
    profile_soft:'Soft', profile_hard:'Hard', profile_pastel:'Pastel', profile_rim:'Rim',
    profile_ambient:'Ambient', profile_custom:'Custom',
    light_color:'Color', light_height:'Height', light_softness:'Softness', light_highlight:'Highlight',
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
    project:'Project', keep_one_project:'Keep at least one project', close_project:'Close project',
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

    // ── v0.7.0 additions: preset/slider labels, filter names, invert chips ──
    preset_soft:'Soft', preset_balanced:'Balanced', preset_crisp:'Crisp',
    lbl_detail:'Detail', lbl_volume:'Volume', lbl_shape:'Shape', lbl_smooth:'Smooth', lbl_crisp:'Micro contrast',
    filter_sobel:'Sobel', filter_scharr:'Scharr',
    invert_r:'R (X)', invert_g:'G (Y)', invert_height:'Height',
    fps_label:'FPS', play_label:'Play', pause_label:'Pause',
    tap_to_load:'Tap to load image',
    // status bar (was hardcoded — now goes through t())
    status_no_image:'No image', status_processing:'Processing…',
    status_ready_prefix:'Ready', frame_singular:'frame', frame_plural:'frames',
    status_ao_working:'AO…', status_ao_ready:'AO ready',
    // Fill modal
    fill_title:'Fill Normals',
    fill_desc:'Radial normal fill — colours spread from the sprite centre outward. Good for round/blob objects.',
    fill_curve:'Dome curvature', fill_radial:'Radial', fill_directional:'Directional',
    fill_use:'Use as normal map', download_label:'Download',
    new_project_title:'New project', zoom_fit:'Fit', zoom_11:'1:1',
    whats_new:"What's new",

    // ── Engine control tab: keybinds + appearance ──
    tab_engine:'Engine',
    keybinds_title:'Keybinds', keybinds_desc:'Shortcuts available anywhere in NormEngine.',
    kb_tab_generate:'Generate tab', kb_tab_fill:'Fill tab', kb_tab_spin:'Spin tab', kb_tab_engine:'Engine tab',
    kb_escape:'Close panel / modal', kb_zoom_in:'Zoom in', kb_zoom_out:'Zoom out', kb_zoom_fit:'Zoom to fit',
    kb_lang:'Switch language',
    appearance_title:'Appearance', appearance_desc:'Pick a visual style — this changes layout details, not just colours.',
    theme_godot:'Godot', theme_godot_desc:'The default look — docked panels, category bars, blue accent.',
    theme_modern:'Modern', theme_modern_desc:'Clean flat cards, soft shadows, no visual clutter.',
    theme_retro:'Retro', theme_retro_desc:'Y2K desktop — beveled buttons, title bar, boxy scrollbars.',
    theme_space:'Space', theme_space_desc:'Ultra-minimal dark glass. Quiet, roomy, low-contrast.',
    theme_light:'Light', theme_dark:'Dark', theme_variant_prompt:'Light or dark?',
    theme_applied:'Style changed',

    // first-run onboarding
    onboarding_welcome:'Welcome to NormEngine',
    onboarding_pick:'Pick a starting style — you can change it anytime from the Engine tab.',
    onboarding_continue:'Continue', onboarding_use_this:'Use this style',
    empty_hint:'Load a sprite to generate a normal map', empty_sub:'100% local · nothing uploaded',
    view_orig_full:'Original', normal_map_lbl:'Normal map', lit_preview_lbl:'Lit preview', ao_map_lbl:'AO map',
    tap_load_image:'Tap to load image',
    retro_minimize:'Minimize', retro_maximize:'Maximize', retro_close:'Close',
    retro_close_title:'NormEngine', retro_close_ok:'OK',
    retro_close_msg:"A web page can't close its own tab. Use your browser's tab controls if you'd really like to leave.",
    proj_settings_title:'Project settings', view_custom:'Custom',
    canvas_size:'Canvas size', canvas_auto:'Automatic', canvas_custom:'Custom',
    canvas_size_hint:"Automatic uses each image's native size. Custom centers every loaded sprite on a fixed-size canvas — handy for keeping a whole set at matching dimensions.",
    canvas_w:'Width', canvas_h:'Height',
    combined_view:'Combined view',
    combined_view_hint:'Choose which panels the "Custom" viewport tab shows together — for example Original + Lit.',
    combined_view_min:'Keep at least one panel selected',
    template:'Template',
    template_hint:"Save this project's settings (not the images) as a file, or load one to start a new project preconfigured the same way.",
    template_download:'Download template', template_load:'Load template — starts a new project',
    template_saved:'Template downloaded', template_loaded:'Template loaded into a new project',
    template_invalid:"That doesn't look like a NormEngine template",
  },

  ru: {
    lang_name:'RU',
    engine:'Движок', eng_classic:'Классика', eng_x:'Экспериментальный',
    tip_xdetail:'<b>Детали</b> — вес мелкой октавы градиента. Тонкая фактура поверхности.',
    tip_xvolume:'<b>Объём</b> — вес крупной октавы. Большие гладкие формы.',
    tip_xshape:'<b>Форма</b> — мягкий купол от силуэта спрайта. Округлость тела.',
    tip_xsmooth:'<b>Сглаживание</b> — финальное сглаживание нормалей. Скругляет углы.',
    tip_xcrisp:'<b>Микро-контраст</b> — возвращает резкость мелкой текстуре после сглаживания.',
    presets:'Пресеты', preset_applied:'Пресет применён',
    x_target:'Тип данных', x_sprite:'Спрайт', x_texture:'Текстура',
    x_sprite_hint:'Спрайт: для игровых ассетов с прозрачностью — мечи, персонажи, предметы. Учитывает силуэт, без ореола по краям, с опциональным «куполом» объёма.',
    x_texture_hint:'Текстура: для тайловых материалов — камень, дерево, ткань. Альфа игнорируется; с «Бесшовно» края заворачиваются — карта тайлится без швов.',
    x_seamless:'Бесшовно (тайлинг)',
    tip_xseam:'<b>Бесшовно</b> — свёртки заворачиваются через края, экспортированная карта нормалей тайлится без швов.',
    tab_spin:'Вращение',
    spin_source:'Источник', spin_use_current:'Взять текущий результат', spin_from_recent:'Из недавних',
    spin_sprite:'Спрайт', spin_normal:'Нормаль', spin_motion:'Движение',
    spin_obj:'Крутится объект', spin_light:'Кружит свет', spin_speed:'Скорость',
    spin_center:'Центр вращения', spin_auto:'Авто', spin_manual:'Вручную',
    spin_pick_hint:'Нажми на превью, чтобы поставить точку вращения.',
    spin_bg:'Фон', spin_bg_color:'Цвет', spin_transparent:'Прозрачный',
    spin_png:'PNG-кадр (500×500)', spin_dur:'Длит., с', spin_record:'Записать видео',
    spin_close:'Закрыть', spin_orbit:'Орбита', spin_mirror:'Зеркально', spin_drag_position:'Потяни, чтобы задать<br>позицию света', light_label:'Свет', recent_normals:'Недавние нормали', layers_tab:'Слои',

    subtitle:'генератор карт нормалей для Godot 4',
    tab_generate:'Генерация', tab_fill:'Заливка',
    tutorial:'Обучение',
    input_mode:'Режим ввода', single:'Один', sheet:'Лист', frames:'Кадры',
    layers_sec:'Спрайты', no_layers:'Слоёв пока нет — добавь ниже.', no_visible_layers:'Все слои скрыты',
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
    profile_soft:'Мягкий', profile_hard:'Резкий', profile_pastel:'Пастельный', profile_rim:'Контровой',
    profile_ambient:'Рассеянный', profile_custom:'Свой',
    light_color:'Цвет', light_height:'Высота', light_softness:'Мягкость', light_highlight:'Блик',
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
    project:'Проект', keep_one_project:'Оставь хотя бы один проект', close_project:'Закрыть проект',
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

    // ── добавления v0.7.0 ──
    preset_soft:'Мягкий', preset_balanced:'Сбаланс.', preset_crisp:'Резкий',
    lbl_detail:'Детали', lbl_volume:'Объём', lbl_shape:'Форма', lbl_smooth:'Сглаживание', lbl_crisp:'Микро-контраст',
    filter_sobel:'Sobel', filter_scharr:'Scharr',
    invert_r:'R (X)', invert_g:'G (Y)', invert_height:'Высота',
    fps_label:'FPS', play_label:'Играть', pause_label:'Пауза',
    tap_to_load:'Нажми, чтобы загрузить фото',
    status_no_image:'Нет изображения', status_processing:'Обработка…',
    status_ready_prefix:'Готово', frame_singular:'кадр', frame_plural:'кадров',
    status_ao_working:'ФО…', status_ao_ready:'ФО готово',
    fill_title:'Заливка нормалей',
    fill_desc:'Радиальная заливка нормалей — цвета растекаются от центра спрайта наружу. Хорошо для круглых/шарообразных объектов.',
    fill_curve:'Кривизна купола', fill_radial:'Радиальная', fill_directional:'Направленная',
    fill_use:'Использовать как карту нормалей', download_label:'Скачать',
    new_project_title:'Новый проект', zoom_fit:'По размеру', zoom_11:'1:1',
    whats_new:'Что нового',

    tab_engine:'Движок',
    keybinds_title:'Горячие клавиши', keybinds_desc:'Работают в любом месте NormEngine.',
    kb_tab_generate:'Вкладка Генерация', kb_tab_fill:'Вкладка Заливка', kb_tab_spin:'Вкладка Вращение', kb_tab_engine:'Вкладка Движок',
    kb_escape:'Закрыть панель / окно', kb_zoom_in:'Приблизить', kb_zoom_out:'Отдалить', kb_zoom_fit:'По размеру окна',
    kb_lang:'Сменить язык',
    appearance_title:'Внешний вид', appearance_desc:'Выбери визуальный стиль — меняются не только цвета, но и детали интерфейса.',
    theme_godot:'Godot', theme_godot_desc:'Стиль по умолчанию — панели-доки, цветные заголовки категорий, синий акцент.',
    theme_modern:'Modern', theme_modern_desc:'Чистые плоские карточки, мягкие тени, ничего лишнего.',
    theme_retro:'Retro', theme_retro_desc:'Стиль начала 2000-х — объёмные кнопки, «шапка окна», квадратные скроллбары.',
    theme_space:'Space', theme_space_desc:'Ультра-минимализм, тёмное стекло. Тихо, просторно, низкий контраст.',
    theme_light:'Светлая', theme_dark:'Тёмная', theme_variant_prompt:'Светлая или тёмная?',
    theme_applied:'Стиль изменён',

    onboarding_welcome:'Добро пожаловать в NormEngine',
    onboarding_pick:'Выбери стартовый стиль — его можно сменить в любой момент во вкладке «Движок».',
    onboarding_continue:'Продолжить', onboarding_use_this:'Выбрать этот стиль',
    empty_hint:'Загрузи спрайт, чтобы создать карту нормалей', empty_sub:'100% локально · ничего не загружается на сервер',
    view_orig_full:'Оригинал', normal_map_lbl:'Карта нормалей', lit_preview_lbl:'С освещением', ao_map_lbl:'Карта AO',
    tap_load_image:'Нажми, чтобы загрузить фото',
    retro_minimize:'Свернуть', retro_maximize:'Развернуть', retro_close:'Закрыть',
    retro_close_title:'NormEngine', retro_close_ok:'ОК',
    retro_close_msg:'Веб-страница не может закрыть свою вкладку сама. Если правда хочешь выйти — используй элементы управления вкладками браузера.',
    proj_settings_title:'Настройки проекта', view_custom:'Свой',
    canvas_size:'Размер канваса', canvas_auto:'Автоматически', canvas_custom:'Свой размер',
    canvas_size_hint:'Автоматически — используется исходный размер каждого изображения. Свой размер — каждый загруженный спрайт центрируется на канвасе фиксированного размера, удобно, чтобы весь набор был одного размера.',
    canvas_w:'Ширина', canvas_h:'Высота',
    combined_view:'Комбинированный вид',
    combined_view_hint:'Выбери, какие панели вкладка «Свой» показывает вместе — например, Оригинал + С освещением.',
    combined_view_min:'Оставь хотя бы одну панель выбранной',
    template:'Шаблон',
    template_hint:'Сохрани настройки этого проекта (без изображений) в файл, или загрузи такой файл, чтобы создать новый проект с этими же настройками.',
    template_download:'Скачать шаблон', template_load:'Загрузить шаблон — создаст новый проект',
    template_saved:'Шаблон скачан', template_loaded:'Шаблон загружен в новый проект',
    template_invalid:'Это не похоже на шаблон NormEngine',
  }
};

const TUT_STEPS_I18N = {
  en: [
    {icon:'⬡',title:'Welcome to NormEngine v0.7.0',text:'This tool generates <b>normal maps</b> for 2D sprites — perfect for Godot 4.x dynamic lighting. Takes ~30 seconds to learn.'},
    {icon:'🖼',title:'Load a sprite',text:'Drag & drop a PNG, or tap to browse. Supports single sprites, <b>spritesheets</b> (auto-sliced), or <b>multiple frames</b> at once.'},
    {icon:'⚙️',title:'Adjust settings',text:'<b>Strength</b> = relief amount.<br><b>Level</b> = detail scale.<br><b>Blur</b> = smooth noise.<br><b>Z Range</b> = depth.<br>Hover <b>ⓘ</b> for tips.'},
    {icon:'💡',title:'Multi-light preview',text:'Add coloured lights in the right panel. Drag the <b>light pad</b> to set direction. See it in the <b>Lit</b> view.'},
    {icon:'🗂',title:'Layers',text:'Switch input mode to <b>Layers</b> to stack multiple images. Each gets its own normal map — tap a layer to preview it alone, or view them blended together.'},
    {icon:'📦',title:'Export for Godot',text:'Use <b>Godot package</b> for a ready-to-drop-in bundle (sprite + normal map + import files + lights script), or copy the <b>.import</b> config / GDScript snippet directly.'},
  ],
  ru: [
    {icon:'⬡',title:'Добро пожаловать в NormEngine v0.7.0',text:'Этот инструмент создаёт <b>карты нормалей</b> для 2D-спрайтов — идеально для динамического света в Godot 4.x. Освоить можно за ~30 секунд.'},
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
  if (typeof applyI18nTitles === 'function') applyI18nTitles();
  if (typeof renderChangelog === 'function') renderChangelog();
  if (typeof renderEngineTab === 'function') renderEngineTab();
  // Light controls are built dynamically, so rebuild them after language
  // changes instead of leaving colour/profile labels in the previous language.
  if (typeof rebuildLightUI === 'function') rebuildLightUI();
  if (typeof rebuildSpinLights === 'function' && typeof Spin !== 'undefined' && Spin.open) rebuildSpinLights();
}

// ── changelog (What's new) ──
const CHANGELOG_I18N = {
  version:'v0.7.0',
  en: [
    'Redesigned the whole interface in a Godot-editor style — docked panels, category bars, custom icon set.',
    'Restored the Spin tool (360° preview / turntable export), which existed in code but had no way to open it.',
    'Experimental engine: added Sprite vs Texture data-type modes; Texture mode generates seamless, tileable normal maps.',
    'New: Engine tab — keyboard shortcut reference and the appearance switcher.',
    'New: four visual styles — Godot, Modern (light/dark), Retro, Space — with a first-run picker.',
    'New: this changelog, opened from the version badge in the header.',
    'Fixed: the on-canvas "load a sprite" hint could get stuck instead of clearing once an image was loaded.',
    'Fixed: mobile bottom sheets could freeze at a half-dragged height and stop responding to taps.',
    'Fixed: the Spin tool could cover the mobile navigation bar with no way back out.',
    'Fixed: many interface labels were missing from the Russian translation — swept and completed.',
    'Fixed: the ambient-occlusion map not scaling with viewport zoom.',
    'Fixed: stale AO maps lingering after switching frames.',
    'Fixed: both engine option panels showing at once after switching projects.',
    'Fixed: the frame-rate control not applying while animation playback was running.',
    'Fixed: the Seamless toggle in Texture mode rendered misaligned; removed the stray lightning emoji from "Experimental".',
    'Fixed: the version badge kept a light background in every style, including dark ones.',
    'Fixed: the "style changed" notification could get stuck on screen instead of fading out, and now follows the current style\'s colours.',
    'Fixed: the active project tab could be scrolled out of view on mobile; the mobile tab bar is now bigger and clearer too.',
    "Fixed: the bottom mobile toolbar's labels could overlap each other.",
    'Fixed: non-square sprites could come out squished in the mobile preview.',
    'Fixed: touch dragging/panning the canvas view was unreliable.',
    'The GitHub button now links to this project\'s repository.',
    'New: Project Settings — a fixed or automatic canvas size, a combined-view layout, and a downloadable/loadable settings template.',
    'New: Retro style\'s window-control buttons are now clickable, with a small easter egg on Close.',
  ],
  ru: [
    'Полностью переработан интерфейс в стиле редактора Godot — панели-доки, заголовки категорий, свой набор иконок.',
    'Восстановлен инструмент «Вращение» (360°-превью / экспорт видео) — был в коде, но нечем было его открыть.',
    'Экспериментальный движок: добавлены режимы Спрайт и Текстура; режим Текстура создаёт бесшовные тайловые карты нормалей.',
    'Новое: вкладка «Движок» — список горячих клавиш и переключатель внешнего вида.',
    'Новое: четыре визуальных стиля — Godot, Modern (светлая/тёмная), Retro, Space — с выбором при первом запуске.',
    'Новое: этот список изменений, открывается по клику на номер версии в шапке.',
    'Исправлено: подсказка «загрузи спрайт» на холсте могла зависать и не пропадать после загрузки изображения.',
    'Исправлено: мобильные шторки могли застревать на полпути перетаскивания и переставать откликаться на нажатия.',
    'Исправлено: инструмент «Вращение» мог перекрывать мобильную навигацию без возможности выйти.',
    'Исправлено: многим подписям интерфейса не хватало русского перевода — пройдено и доделано.',
    'Исправлено: карта ambient occlusion не масштабировалась вместе с зумом.',
    'Исправлено: устаревшая AO-карта оставалась видна после смены кадра.',
    'Исправлено: обе панели настроек движка отображались одновременно после смены проекта.',
    'Исправлено: смена FPS не применялась во время воспроизведения анимации.',
    'Исправлено: тумблер «Бесшовно» в режиме Текстура отображался со сдвигом; убрана лишняя эмодзи-молния из «Экспериментальный».',
    'Исправлено: бейдж версии оставался светлым в любом стиле, включая тёмные.',
    'Исправлено: уведомление «стиль изменён» могло зависать на экране вместо исчезновения, и теперь следует цветам текущего стиля.',
    'Исправлено: активную вкладку проекта могло прокрутить за пределы экрана на телефоне; сама панель вкладок стала крупнее и заметнее.',
    'Исправлено: подписи нижней мобильной панели могли наезжать друг на друга.',
    'Исправлено: не-квадратные спрайты могли сплющиваться в мобильном превью.',
    'Исправлено: перетаскивание/панорамирование канваса пальцем работало нестабильно.',
    'Кнопка GitHub теперь ведёт на репозиторий этого проекта.',
    'Новое: «Настройки проекта» — фиксированный или автоматический размер канваса, комбинированный вид панелей и шаблон настроек для скачивания/загрузки.',
    'Новое: кнопки управления окном в стиле Retro теперь кликабельны, с маленькой пасхалкой на «Закрыть».',
  ],
};
function renderChangelog(){
  const items = CHANGELOG_I18N[curLang] || CHANGELOG_I18N.en;
  const box = $('changelogBody'); if (!box) return;
  box.innerHTML = `
    <div class="cl-release">
      <div class="cl-version">${CHANGELOG_I18N.version}</div>
      <ul class="cl-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>`;
}

// RU needs 3 plural forms (1 кадр / 2-4 кадра / 5+ кадров); EN just 1 vs many.
function pluralFrames(n){
  if (curLang === 'ru'){
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return t('frame_singular');
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'кадра';
    return t('frame_plural');
  }
  return n === 1 ? t('frame_singular') : t('frame_plural');
}

// data-i18n-title: localize a `title` tooltip attribute the same way
// data-i18n localizes text content (added in v0.7.0 alongside the RU sweep).
function applyI18nTitles(){
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
}
