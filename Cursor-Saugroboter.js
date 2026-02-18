// Cursor Saugroboter – eine einzelne Lovelace-Karte: Map, Dark/Hell, Raum-Dropdown, Status, Steuerung
// Voraussetzung: Dreame Vacuum Integration, optional Xiaomi Vacuum Map Card für interaktive Map

(function() {
  const DEFAULT_TITLE = 'Saugroboter';
  const THEMES = ['Dark', 'Hell'];

  function getVacuumName(vacuumEntity) {
    if (!vacuumEntity) return '';
    return vacuumEntity.replace(/^vacuum\./, '');
  }

  function dispatchConfig(editor, config) {
    editor.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: config },
      bubbles: true,
      composed: true
    }));
  }

  const MAX_ENTITY_RESULTS = 12;
  const listStyle = 'position:absolute;left:0;right:0;top:100%;z-index:100;max-height:220px;overflow-y:auto;background:var(--ha-card-background);border:1px solid var(--divider-color);border-radius:8px;margin-top:2px;box-shadow:0 4px 12px rgba(0,0,0,0.15);list-style:none;margin:2px 0 0;padding:0;';
  const itemStyle = 'padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--divider-color);display:block;';
  const itemHoverStyle = 'background:var(--primary-color);color:var(--text-primary-color);';

  function filterEntities(hass, query, domainPrefix) {
    if (!hass || !hass.states) return [];
    const q = (query || '').trim().toLowerCase();
    const out = [];
    for (const id of Object.keys(hass.states)) {
      if (domainPrefix && !id.startsWith(domainPrefix)) continue;
      const s = hass.states[id];
      const name = (s.attributes && s.attributes.friendly_name) || id;
      if (!q || id.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
        out.push({ entity_id: id, name: name });
      }
    }
    out.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
    return out.slice(0, MAX_ENTITY_RESULTS);
  }

  // ========== Konfigurations-Editor ==========
  class CursorSaugroboterCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      if (this.shadowRoot) this._render();
    }
    set hass(hass) { this._hass = hass; }
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._render();
    }
    _addField(w, labelText, el, mb) {
      const label = document.createElement('label');
      label.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;margin-top:12px;';
      label.textContent = labelText;
      w.appendChild(label);
      if (el.style) el.style.marginBottom = mb || '16px';
      w.appendChild(el);
    }
    _render() {
      if (!this.shadowRoot) return;
      const c = this._config;
      const style = 'width:100%;max-width:400px;padding:8px 12px;box-sizing:border-box;font-size:14px;';
      const w = document.createElement('div');
      w.style.cssText = 'padding:16px;line-height:1.5;font-size:14px;';

      const h = document.createElement('h3');
      h.style.marginTop = '0';
      h.textContent = 'Cursor Saugroboter – eine Karte';
      w.appendChild(h);

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.value = c.title || DEFAULT_TITLE;
      titleInput.placeholder = DEFAULT_TITLE;
      titleInput.style.cssText = style;

      const CARD_TYPE = 'custom:cursor-saugroboter-card';
      const getConfig = () => ({
        type: CARD_TYPE,
        title: titleInput.value.trim() || undefined,
        vacuum_entity: vacuumInput.value.trim() || undefined,
        map_camera: mapInput.value.trim() || undefined,
        room_select_entity: roomSelectInput.value.trim() || undefined,
        room_script_entity: roomScriptInput.value.trim() || undefined,
        default_theme: themeSelect.value
      });

      const vacuumWrap = document.createElement('div');
      vacuumWrap.style.position = 'relative';
      vacuumWrap.style.maxWidth = '400px';
      const vacuumInput = document.createElement('input');
      vacuumInput.type = 'text';
      vacuumInput.value = c.vacuum_entity || '';
      vacuumInput.placeholder = 'Tippen zum Suchen: vacuum. …';
      vacuumInput.style.cssText = 'width:100%;padding:8px 12px;box-sizing:border-box;font-size:14px;';
      const vacuumList = document.createElement('ul');
      vacuumList.style.cssText = listStyle;
      vacuumList.hidden = true;
      vacuumWrap.appendChild(vacuumInput);
      vacuumWrap.appendChild(vacuumList);

      const mapWrap = document.createElement('div');
      mapWrap.style.position = 'relative';
      mapWrap.style.maxWidth = '400px';
      const mapInput = document.createElement('input');
      mapInput.type = 'text';
      mapInput.value = c.map_camera || '';
      mapInput.placeholder = 'Tippen zum Suchen: camera. …';
      mapInput.style.cssText = 'width:100%;padding:8px 12px;box-sizing:border-box;font-size:14px;';
      const mapList = document.createElement('ul');
      mapList.style.cssText = listStyle;
      mapList.hidden = true;
      mapWrap.appendChild(mapInput);
      mapWrap.appendChild(mapList);

      const roomWrap = document.createElement('div');
      roomWrap.style.position = 'relative';
      roomWrap.style.maxWidth = '400px';
      const roomSelectInput = document.createElement('input');
      roomSelectInput.type = 'text';
      roomSelectInput.value = c.room_select_entity || '';
      roomSelectInput.placeholder = 'Tippen zum Suchen: input_select. …';
      roomSelectInput.style.cssText = 'width:100%;padding:8px 12px;box-sizing:border-box;font-size:14px;';
      const roomList = document.createElement('ul');
      roomList.style.cssText = listStyle;
      roomList.hidden = true;
      roomWrap.appendChild(roomSelectInput);
      roomWrap.appendChild(roomList);

      const scriptWrap = document.createElement('div');
      scriptWrap.style.position = 'relative';
      scriptWrap.style.maxWidth = '400px';
      const roomScriptInput = document.createElement('input');
      roomScriptInput.type = 'text';
      roomScriptInput.value = c.room_script_entity || '';
      roomScriptInput.placeholder = 'Tippen zum Suchen: script. …';
      roomScriptInput.style.cssText = 'width:100%;padding:8px 12px;box-sizing:border-box;font-size:14px;';
      const scriptList = document.createElement('ul');
      scriptList.style.cssText = listStyle;
      scriptList.hidden = true;
      scriptWrap.appendChild(roomScriptInput);
      scriptWrap.appendChild(scriptList);

      function bindEntitySearch(inp, listEl, domainPrefix, getCfg) {
        let hideTimer = 0;
        function show() {
          window.clearTimeout(hideTimer);
          const entities = filterEntities(self._hass, inp.value, domainPrefix);
          listEl.innerHTML = '';
          if (entities.length === 0) { listEl.hidden = true; return; }
          entities.forEach(function(e) {
            const li = document.createElement('li');
            li.style.cssText = itemStyle;
            li.textContent = e.name;
            li.title = e.entity_id;
            li.addEventListener('mouseenter', function() { this.style.cssText = itemStyle + itemHoverStyle; });
            li.addEventListener('mouseleave', function() { this.style.cssText = itemStyle; });
            li.addEventListener('mousedown', function(ev) {
              ev.preventDefault();
              inp.value = e.entity_id;
              listEl.hidden = true;
              dispatchConfig(self, getCfg());
            });
            listEl.appendChild(li);
          });
          listEl.hidden = false;
        }
        function hide() { hideTimer = window.setTimeout(function() { listEl.hidden = true; }, 200); }
        inp.addEventListener('input', function() { show(); });
        inp.addEventListener('focus', function() { show(); });
        inp.addEventListener('blur', function() {
          hide();
          dispatchConfig(self, getCfg());
        });
      }
      const self = this;

      bindEntitySearch(vacuumInput, vacuumList, 'vacuum.', getConfig);
      bindEntitySearch(mapInput, mapList, 'camera.', getConfig);
      bindEntitySearch(roomSelectInput, roomList, 'input_select.', getConfig);
      bindEntitySearch(roomScriptInput, scriptList, 'script.', getConfig);

      titleInput.addEventListener('blur', () => dispatchConfig(this, getConfig()));

      const themeSelect = document.createElement('select');
      themeSelect.style.cssText = style;
      THEMES.forEach(t => {
        const o = document.createElement('option');
        o.value = t;
        o.textContent = t;
        o.selected = (c.default_theme || 'Dark') === t;
        themeSelect.appendChild(o);
      });
      themeSelect.addEventListener('change', () => dispatchConfig(this, getConfig()));

      this._addField(w, 'Titel der Karte', titleInput);
      this._addField(w, 'Vacuum-Entity (Pflicht)', vacuumWrap);
      this._addField(w, 'Map-Kamera (Pflicht)', mapWrap);
      this._addField(w, 'Raum-Dropdown (optional)', roomWrap);
      this._addField(w, 'Script „Raum starten“ (optional)', scriptWrap);
      const themeLabel = document.createElement('label');
      themeLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;margin-top:12px;';
      themeLabel.textContent = 'Karten-Hintergrund (Standard)';
      w.appendChild(themeLabel);
      w.appendChild(themeSelect);
      themeSelect.style.marginBottom = '16px';

      const info = document.createElement('div');
      info.style.cssText = 'margin-top:20px;padding:12px;background:var(--ha-card-background, var(--secondary-background-color));border-radius:8px;font-size:13px;';
      info.innerHTML = '<p><strong>Eine Karte</strong> – Map, Dark/Hell, Raum-Dropdown, Status und Steuerung (Saugen, Wischen, Start/Stopp) sind in dieser einen Karte enthalten.</p><p>Entity-Felder: Tippen zum Suchen, Liste aktualisiert sich bei jedem Buchstaben.</p>';
      w.appendChild(info);

      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(w);
    }
  }

  // ========== Karte ==========
  class CursorSaugroboterCard extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      this._theme = this._config.default_theme || 'Dark';
      this._mapEl = null;
      this._statusRow = null;
      this._roomSel = null;
      this._render();
    }
    set hass(hass) {
      this._hass = hass;
      if (this._mapEl != null || this._statusRow != null) {
        this._updateDynamic();
        return;
      }
      this._render();
    }
    getCardSize() { return 10; }

    _state(entityId) {
      if (!this._hass || !entityId) return null;
      return this._hass.states[entityId];
    }
    _callService(domain, service, data) {
      if (!this._hass) return;
      this._hass.callService(domain, service, data);
    }

    _updateDynamic() {
      if (!this._hass || !this._config) return;
      const c = this._config;
      const vacuumName = getVacuumName(c.vacuum_entity);
      if (this._mapEl) {
        this._mapEl.hass = this._hass;
      }
      if (this._statusRow && vacuumName) {
        const sensor = (name, entityId) => {
          if (!entityId) {
            const d = document.createElement('div');
            d.style.cssText = 'font-size: 12px;';
            d.innerHTML = '<strong>' + name + '</strong>: –';
            return d;
          }
          const s = this._state(entityId);
          const v = s ? (s.attributes && s.attributes.unit_of_measurement ? s.state + ' ' + s.attributes.unit_of_measurement : s.state) : '–';
          const d = document.createElement('div');
          d.style.cssText = 'font-size: 12px;';
          d.innerHTML = '<strong>' + name + '</strong>: ' + v;
          return d;
        };
        const batteryEntity = c.battery_entity || ('sensor.' + vacuumName + '_battery_level');
        const suctionEntity = c.suction_entity || ('select.' + vacuumName + '_suction_level');
        const areaEntity = c.area_entity || ('sensor.' + vacuumName + '_cleaned_area');
        const timeEntity = c.time_entity || ('sensor.' + vacuumName + '_cleaning_time');
        const modeStatusEntity = c.mode_entity || ('select.' + vacuumName + '_cleaning_mode');
        const roomStatusEntity = c.room_status_entity || ('sensor.' + vacuumName + '_current_room');
        this._statusRow.innerHTML = '';
        this._statusRow.appendChild(sensor('Batterie', batteryEntity));
        this._statusRow.appendChild(sensor('Saugkraft', suctionEntity));
        this._statusRow.appendChild(sensor('Fläche', areaEntity));
        this._statusRow.appendChild(sensor('Zeit', timeEntity));
        this._statusRow.appendChild(sensor('Modus', modeStatusEntity));
        this._statusRow.appendChild(sensor('Raum', roomStatusEntity));
      }
      if (this._roomSel && c.room_select_entity) {
        const roomState = this._state(c.room_select_entity);
        const sel = this._roomSel;
        const prev = sel.value;
        sel.innerHTML = '';
        if (roomState && roomState.attributes && roomState.attributes.options) {
          roomState.attributes.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            if (roomState.state === opt) o.selected = true;
            sel.appendChild(o);
          });
          if (prev && sel.options.length) sel.value = prev;
        }
      }
    }

    _applyMapStyle(mapEl) {
      if (!mapEl || !mapEl.style || !mapEl.style.setProperty) return;
      const isDark = this._theme === 'Dark';
      const vars = {
        "--map-card-predefined-rectangle-fill-color": "transparent",
        "--map-card-predefined-rectangle-line-color": "transparent",
        "--map-card-predefined-rectangle-fill-color-selected": "transparent",
        "--map-card-predefined-rectangle-line-color-selected": "transparent",
        "--map-card-room-outline-fill-color": "transparent",
        "--map-card-room-outline-fill-color-selected": "transparent",
        "--map-card-room-outline-line-color":
          isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(30, 64, 175, 0.35)",
        "--map-card-room-outline-line-color-selected":
          isDark ? "rgba(148, 163, 184, 0.55)" : "rgba(30, 64, 175, 0.55)",
        "--map-card-manual-path-line-color": "transparent",
        "--map-card-manual-path-point-fill-color": "transparent",
        "--map-card-manual-path-point-line-color": "transparent",
        "--map-card-manual-rectangle-fill-color": "transparent",
        "--map-card-manual-rectangle-line-color": "transparent",
        "--map-card-predefined-point-icon-background-color": "transparent",
        "--map-card-predefined-point-label-color": "transparent",
        "--map-card-primary-color": isDark ? "#38bdf8" : "#2563eb",
        "--map-card-secondary-color": isDark ? "#111827" : "#e5e7eb",
        "--map-card-zoomer-background": isDark
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(248, 250, 252, 0.95)",
        // Raum-Icons ausblenden, nur Beschriftung lassen
        "--map-card-room-icon-background-color": "transparent",
        "--map-card-room-icon-background-color-selected": "transparent",
        "--map-card-room-icon-color": "transparent",
        "--map-card-room-icon-color-selected": "transparent",
        "--map-card-room-label-color": isDark ? "#e5e7eb" : "#0f172a",
        "--map-card-room-label-color-selected": isDark ? "#e5e7eb" : "#0f172a",
        "--map-card-room-label-font-size": "12px"
      };
      Object.entries(vars).forEach(([k, v]) => mapEl.style.setProperty(k, v));
    }

    _render() {
      if (!this._config || !this._hass) return;
      const c = this._config;
      const vacuumEntity = c.vacuum_entity;
      const mapCamera = c.map_camera;
      const vacuumName = getVacuumName(vacuumEntity);
      if (!vacuumEntity || !mapCamera) {
        this._mapEl = null;
        this._statusRow = null;
        this._roomSel = null;
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '';
        const card = document.createElement('ha-card');
        card.header = c.title || DEFAULT_TITLE;
        const body = document.createElement('div');
        body.style.padding = '16px';
        body.innerHTML = '<p>Bitte <strong>Vacuum-Entity</strong> und <strong>Map-Kamera</strong> in der Karten-Konfiguration eintragen.</p>';
        card.appendChild(body);
        this.shadowRoot.appendChild(card);
        return;
      }

      const card = document.createElement('ha-card');
      card.header = c.title || DEFAULT_TITLE;

      const container = document.createElement('div');
      container.style.cssText = 'padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;';

      const row = (children) => {
        const r = document.createElement('div');
        r.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center;';
        children.forEach(ch => r.appendChild(ch));
        return r;
      };
      const btn = (label, icon, fn) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = 'padding: 8px 12px; cursor: pointer; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--ha-card-background); color: var(--primary-text-color); font-size: 13px;';
        b.addEventListener('click', fn);
        return b;
      };

      const themeRow = row([
        (() => {
          const sel = document.createElement('select');
          sel.style.cssText = 'padding: 6px 10px; font-size: 13px;';
          THEMES.forEach(t => {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t;
            o.selected = this._theme === t;
            sel.appendChild(o);
          });
          sel.addEventListener('change', () => {
            this._theme = sel.value;
            this._render();
          });
          return sel;
        })(),
        document.createTextNode(' Karten-Hintergrund')
      ]);
      container.appendChild(themeRow);

      if (c.room_select_entity) {
        const roomState = this._state(c.room_select_entity);
        const roomSel = document.createElement('select');
        this._roomSel = roomSel;
        roomSel.style.cssText = 'padding: 6px 10px; font-size: 13px; min-width: 140px;';
        if (roomState && roomState.attributes && roomState.attributes.options) {
          roomState.attributes.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            if (roomState.state === opt) o.selected = true;
            roomSel.appendChild(o);
          });
        }
        roomSel.addEventListener('change', () => {
          this._callService('input_select', 'select_option', {
            entity_id: c.room_select_entity,
            option: roomSel.value
          });
        });
        roomSel.style.marginRight = '8px';
        const roomBtn = btn('Raum starten', null, () => {
          if (c.room_script_entity) this._callService('script', 'turn_on', { entity_id: c.room_script_entity });
        });
        container.appendChild(row([document.createTextNode('Raum: '), roomSel, roomBtn]));
      } else {
        this._roomSel = null;
      }

      const sensor = (name, entityId) => {
        if (!entityId) {
          const d = document.createElement('div');
          d.style.cssText = 'font-size: 12px;';
          d.innerHTML = '<strong>' + name + '</strong>: –';
          return d;
        }
        const s = this._state(entityId);
        const v = s ? (s.attributes && s.attributes.unit_of_measurement ? s.state + ' ' + s.attributes.unit_of_measurement : s.state) : '–';
        const d = document.createElement('div');
        d.style.cssText = 'font-size: 12px;';
        d.innerHTML = '<strong>' + name + '</strong>: ' + v;
        return d;
      };
      const statusRow = document.createElement('div');
      this._statusRow = statusRow;
      statusRow.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;';
      if (vacuumName) {
        const batteryEntity = this._config.battery_entity || ('sensor.' + vacuumName + '_battery_level');
        const suctionEntity = this._config.suction_entity || ('select.' + vacuumName + '_suction_level');
        const areaEntity = this._config.area_entity || ('sensor.' + vacuumName + '_cleaned_area');
        const timeEntity = this._config.time_entity || ('sensor.' + vacuumName + '_cleaning_time');
        const modeStatusEntity = this._config.mode_entity || ('select.' + vacuumName + '_cleaning_mode');
        const roomStatusEntity = this._config.room_status_entity || ('sensor.' + vacuumName + '_current_room');

        statusRow.appendChild(sensor('Batterie', batteryEntity));
        statusRow.appendChild(sensor('Saugkraft', suctionEntity));
        statusRow.appendChild(sensor('Fläche', areaEntity));
        statusRow.appendChild(sensor('Zeit', timeEntity));
        statusRow.appendChild(sensor('Modus', modeStatusEntity));
        statusRow.appendChild(sensor('Raum', roomStatusEntity));
      }
      container.appendChild(statusRow);

      const modeEntity = 'select.' + vacuumName + '_cleaning_mode';
      container.appendChild(row([
        btn('Nur Saugen', null, () => this._callService('select', 'select_option', { entity_id: modeEntity, option: 'Sweeping' })),
        btn('Saugen & Wischen', null, () => this._callService('select', 'select_option', { entity_id: modeEntity, option: 'Sweeping and mopping' })),
        btn('Nur Wischen', null, () => this._callService('select', 'select_option', { entity_id: modeEntity, option: 'Mopping' })),
        btn('Start', null, () => this._callService('vacuum', 'start', { entity_id: vacuumEntity })),
        btn('Stopp', null, () => this._callService('vacuum', 'stop', { entity_id: vacuumEntity }))
      ]));

      const mapWrap = document.createElement('div');
      mapWrap.style.cssText = 'margin-top: 8px; border-radius: 8px; overflow: hidden; background: var(--secondary-background-color); min-height: 200px;';
      let mapUsed = false;
      if (typeof customElements.get('xiaomi-vacuum-map-card') === 'function') {
        try {
          const mapEl = document.createElement('xiaomi-vacuum-map-card');
          this._mapEl = mapEl;
          mapEl.setConfig({
            entity: vacuumEntity,
            map_source: { camera: mapCamera },
            calibration_source: { camera: true },
            vacuum_platform: 'Tasshack/dreame-vacuum',
            tiles: [],
            icons: []
          });
          this._applyMapStyle(mapEl);
          mapEl.hass = this._hass;
          mapWrap.appendChild(mapEl);
          mapUsed = true;
        } catch (e) {
          this._mapEl = null;
        }
      } else {
        this._mapEl = null;
      }
      if (!mapUsed) {
        this._mapEl = null;
        const img = document.createElement('img');
        img.alt = 'Map';
        img.style.cssText = 'width: 100%; display: block;';
        img.src = this._hass.hassUrl('/api/camera_proxy/' + mapCamera) + '?t=' + Date.now();
        mapWrap.appendChild(img);
        const hint = document.createElement('div');
        hint.style.cssText = 'padding: 8px; font-size: 12px; color: var(--secondary-text-color);';
        hint.textContent = 'Map (Kamera). Für interaktive Karte: Xiaomi Vacuum Map Card über HACS installieren.';
        mapWrap.appendChild(hint);
      }
      container.appendChild(mapWrap);

      card.appendChild(container);
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(card);
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._render();
    }
    static getConfigElement() {
      return document.createElement('cursor-saugroboter-card-editor');
    }
    static getStubConfig() {
      return {
        title: DEFAULT_TITLE,
        vacuum_entity: 'vacuum.dreame_vacuum_r2449k',
        map_camera: 'camera.dreame_vacuum_r2449k_map',
        room_select_entity: 'input_select.saugroboter_raum',
        room_script_entity: 'script.saugroboter_raum_reinigen',
        // optionale Status-Entitäten; wenn leer, werden Standard-Namen aus vacuum_entity abgeleitet
        battery_entity: undefined,
        suction_entity: undefined,
        area_entity: undefined,
        time_entity: undefined,
        mode_entity: undefined,
        room_status_entity: undefined,
        default_theme: 'Dark'
      };
    }
  }

  // ========== Einfache Floorplan-Karte (nur Räume + Roboter-Position) ==========
  class CursorSaugroboterFloorplanCard extends HTMLElement {
    setConfig(config) {
      if (!config.vacuum_entity) {
        throw new Error('vacuum_entity ist erforderlich');
      }
      this._config = config;
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    getCardSize() {
      return 4;
    }

    _state(entityId) {
      if (!this._hass || !entityId) return null;
      return this._hass.states[entityId];
    }

    _render() {
      if (!this._config || !this._hass) return;
      const c = this._config;
      const vacuumEntity = c.vacuum_entity;
      const vacuumName = getVacuumName(vacuumEntity);
      const roomState = this._state(
        c.room_status_entity || ('sensor.' + vacuumName + '_current_room')
      );
      const currentRoom = roomState ? roomState.state : null;
      const roomsCfg = c.rooms || [];

      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = '';

      const card = document.createElement('ha-card');
      card.header = c.title || 'Saugroboter – Floorplan';

      const wrap = document.createElement('div');
      wrap.style.cssText =
        'padding:12px 16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;';

      roomsCfg.forEach((r) => {
        const id = r.id || r.name || '';
        const label = r.label || r.name || id;
        const box = document.createElement('div');
        box.style.cssText =
          'position:relative;border-radius:8px;border:1px solid rgba(148,163,184,0.4);' +
          'padding:8px;font-size:12px;box-sizing:border-box;min-height:60px;' +
          'background:rgba(15,23,42,0.95);color:#e5e7eb;';

        const title = document.createElement('div');
        title.textContent = label || id;
        title.style.cssText = 'font-weight:500;margin-bottom:4px;';
        box.appendChild(title);

        const match =
          currentRoom &&
          (currentRoom === id ||
            currentRoom === label ||
            (r.match && currentRoom === r.match));

        if (match) {
          box.style.background = 'rgba(56,189,248,0.16)';
          const robot = document.createElement('div');
          robot.textContent = 'R';
          robot.style.cssText =
            'position:absolute;right:8px;bottom:6px;width:18px;height:18px;' +
            'border-radius:50%;border:2px solid #38bdf8;color:#38bdf8;' +
            'font-size:11px;display:flex;align-items:center;justify-content:center;';
          box.appendChild(robot);
        }

        wrap.appendChild(box);
      });

      card.appendChild(wrap);
      this.shadowRoot.appendChild(card);
    }

    static getStubConfig() {
      return {
        title: 'Saugroboter – Floorplan',
        vacuum_entity: 'vacuum.saros_10r',
        rooms: [
          { id: '1', label: 'FerienSchule' },
          { id: '2', label: 'Lager' }
        ]
      };
    }
  }

  customElements.define('cursor-saugroboter-card-editor', CursorSaugroboterCardEditor);
  customElements.define('cursor-saugroboter-card', CursorSaugroboterCard);
  customElements.define('cursor-saugroboter-floorplan-card', CursorSaugroboterFloorplanCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'cursor-saugroboter-card',
    name: 'Cursor Saugroboter',
    description: 'Eine Karte: Map, Dark/Hell, Raum-Dropdown, Status, Saugen/Wischen/Start/Stopp'
  });
  window.customCards.push({
    type: 'cursor-saugroboter-floorplan-card',
    name: 'Cursor Saugroboter Floorplan',
    description: 'Einfacher Grundriss: Räume + aktueller Roboter-Raum'
  });
})();
