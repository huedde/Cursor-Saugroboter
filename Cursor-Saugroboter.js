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
    _addField(w, labelText, input, mb) {
      const label = document.createElement('label');
      label.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;margin-top:12px;';
      label.textContent = labelText;
      w.appendChild(label);
      input.style.marginBottom = mb || '16px';
      w.appendChild(input);
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
      const vacuumInput = document.createElement('input');
      vacuumInput.type = 'text';
      vacuumInput.value = c.vacuum_entity || '';
      vacuumInput.placeholder = 'vacuum.dreame_vacuum_r2449k';
      vacuumInput.style.cssText = style;
      const mapInput = document.createElement('input');
      mapInput.type = 'text';
      mapInput.value = c.map_camera || '';
      mapInput.placeholder = 'camera.dreame_vacuum_r2449k_map';
      mapInput.style.cssText = style;
      const roomSelectInput = document.createElement('input');
      roomSelectInput.type = 'text';
      roomSelectInput.value = c.room_select_entity || '';
      roomSelectInput.placeholder = 'input_select.saugroboter_raum';
      roomSelectInput.style.cssText = style;
      const roomScriptInput = document.createElement('input');
      roomScriptInput.type = 'text';
      roomScriptInput.value = c.room_script_entity || '';
      roomScriptInput.placeholder = 'script.saugroboter_raum_reinigen';
      roomScriptInput.style.cssText = style;
      const themeSelect = document.createElement('select');
      themeSelect.style.cssText = style;
      THEMES.forEach(t => {
        const o = document.createElement('option');
        o.value = t;
        o.textContent = t;
        o.selected = (c.default_theme || 'Dark') === t;
        themeSelect.appendChild(o);
      });

      const getConfig = () => ({
        title: titleInput.value.trim() || undefined,
        vacuum_entity: vacuumInput.value.trim() || undefined,
        map_camera: mapInput.value.trim() || undefined,
        room_select_entity: roomSelectInput.value.trim() || undefined,
        room_script_entity: roomScriptInput.value.trim() || undefined,
        default_theme: themeSelect.value
      });

      [titleInput, vacuumInput, mapInput, roomSelectInput, roomScriptInput].forEach(inp => {
        inp.addEventListener('input', () => dispatchConfig(this, getConfig()));
      });
      themeSelect.addEventListener('change', () => dispatchConfig(this, getConfig()));

      this._addField(w, 'Titel der Karte', titleInput);
      this._addField(w, 'Vacuum-Entity (Pflicht)', vacuumInput);
      this._addField(w, 'Map-Kamera (Pflicht)', mapInput);
      this._addField(w, 'Raum-Dropdown (optional)', roomSelectInput);
      this._addField(w, 'Script „Raum starten“ (optional)', roomScriptInput);
      const themeLabel = document.createElement('label');
      themeLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:500;margin-top:12px;';
      themeLabel.textContent = 'Karten-Hintergrund (Standard)';
      w.appendChild(themeLabel);
      w.appendChild(themeSelect);
      themeSelect.style.marginBottom = '16px';

      const info = document.createElement('div');
      info.style.cssText = 'margin-top:20px;padding:12px;background:var(--ha-card-background, var(--secondary-background-color));border-radius:8px;font-size:13px;';
      info.innerHTML = '<p><strong>Eine Karte</strong> – Map, Dark/Hell, Raum-Dropdown, Status und Steuerung (Saugen, Wischen, Start/Stopp) sind in dieser einen Karte enthalten.</p>';
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
      this._render();
    }
    set hass(hass) {
      this._hass = hass;
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

    _render() {
      if (!this._config || !this._hass) return;
      const c = this._config;
      const vacuumEntity = c.vacuum_entity;
      const mapCamera = c.map_camera;
      const vacuumName = getVacuumName(vacuumEntity);
      if (!vacuumEntity || !mapCamera) {
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
      }

      const sensor = (name, entityId) => {
        const s = this._state(entityId);
        const v = s ? (s.attributes && s.attributes.unit_of_measurement ? s.state + ' ' + s.attributes.unit_of_measurement : s.state) : '–';
        const d = document.createElement('div');
        d.style.cssText = 'font-size: 12px;';
        d.innerHTML = '<strong>' + name + '</strong>: ' + v;
        return d;
      };
      const statusRow = document.createElement('div');
      statusRow.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;';
      if (vacuumName) {
        statusRow.appendChild(sensor('Batterie', 'sensor.' + vacuumName + '_battery_level'));
        statusRow.appendChild(sensor('Saugkraft', 'select.' + vacuumName + '_suction_level'));
        statusRow.appendChild(sensor('Fläche', 'sensor.' + vacuumName + '_cleaned_area'));
        statusRow.appendChild(sensor('Zeit', 'sensor.' + vacuumName + '_cleaning_time'));
        statusRow.appendChild(sensor('Modus', 'select.' + vacuumName + '_cleaning_mode'));
        statusRow.appendChild(sensor('Raum', 'sensor.' + vacuumName + '_current_room'));
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
          mapEl.setConfig({
            entity: vacuumEntity,
            map_source: { camera: mapCamera },
            calibration_source: { camera: true },
            vacuum_platform: 'Tasshack/dreame-vacuum',
            tiles: [],
            icons: []
          });
          mapEl.hass = this._hass;
          mapWrap.appendChild(mapEl);
          mapUsed = true;
        } catch (e) {}
      }
      if (!mapUsed) {
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
        default_theme: 'Dark'
      };
    }
  }

  customElements.define('cursor-saugroboter-card-editor', CursorSaugroboterCardEditor);
  customElements.define('cursor-saugroboter-card', CursorSaugroboterCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'cursor-saugroboter-card',
    name: 'Cursor Saugroboter',
    description: 'Eine Karte: Map, Dark/Hell, Raum-Dropdown, Status, Saugen/Wischen/Start/Stopp'
  });
})();
