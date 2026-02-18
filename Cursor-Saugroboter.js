// Cursor Saugroboter – HACS-kompatible Lovelace-Info-Karte mit visuellem Editor
// Die eigentliche Vacuum-Karte ist die YAML-View (vacuum-karte.yaml). Siehe README.

(function() {
  const CARD_TITLE_DEFAULT = 'Cursor Saugroboter';
  const VIEW_PATH_DEFAULT = 'saugroboter';
  const BUTTON_TEXT_DEFAULT = 'Zur Vacuum-Karte öffnen';

  function dispatchConfigChanged(editor, config) {
    editor.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: config },
      bubbles: true,
      composed: true
    }));
  }

  // ========== Konfigurations-Editor (visueller Editor) ==========
  class CursorSaugroboterCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      if (this.shadowRoot) this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._render();
    }

    _addField(wrapper, labelText, input, marginBottom) {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '6px';
      label.style.fontWeight = '500';
      label.style.marginTop = marginBottom ? '0' : '12px';
      label.textContent = labelText;
      wrapper.appendChild(label);
      input.style.marginBottom = marginBottom || '16px';
      wrapper.appendChild(input);
    }

    _render() {
      if (!this.shadowRoot) return;
      const c = this._config;
      const title = c.title || CARD_TITLE_DEFAULT;
      const viewPath = c.view_path !== undefined ? c.view_path : VIEW_PATH_DEFAULT;
      const showButton = c.show_view_button !== false;
      const buttonText = c.button_text || BUTTON_TEXT_DEFAULT;

      const wrapper = document.createElement('div');
      wrapper.style.padding = '16px';
      wrapper.style.lineHeight = '1.5';
      wrapper.style.fontSize = '14px';

      const headline = document.createElement('h3');
      headline.style.marginTop = '0';
      headline.style.marginBottom = '16px';
      headline.textContent = 'Cursor Saugroboter – Konfiguration';
      wrapper.appendChild(headline);

      const inputStyle = 'width: 100%; max-width: 400px; padding: 8px 12px; box-sizing: border-box; font-size: 14px;';

      const getConfig = () => {
        const cfg = {};
        if (titleInput.value.trim()) cfg.title = titleInput.value.trim();
        if (viewPathInput.value.trim()) cfg.view_path = viewPathInput.value.trim();
        cfg.show_view_button = showButtonCheck.checked;
        if (buttonTextInput.value.trim()) cfg.button_text = buttonTextInput.value.trim();
        return cfg;
      };

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.value = title;
      titleInput.placeholder = CARD_TITLE_DEFAULT;
      titleInput.style.cssText = inputStyle;
      titleInput.addEventListener('input', () => dispatchConfigChanged(this, getConfig()));
      this._addField(wrapper, 'Titel der Karte', titleInput);

      const viewPathInput = document.createElement('input');
      viewPathInput.type = 'text';
      viewPathInput.value = viewPath;
      viewPathInput.placeholder = 'z. B. saugroboter';
      viewPathInput.style.cssText = inputStyle;
      viewPathInput.addEventListener('input', () => dispatchConfigChanged(this, getConfig()));
      this._addField(wrapper, 'View-Pfad (Vacuum-View im Dashboard)', viewPathInput);

      const showButtonLabel = document.createElement('label');
      showButtonLabel.style.display = 'flex';
      showButtonLabel.style.alignItems = 'center';
      showButtonLabel.style.gap = '8px';
      showButtonLabel.style.marginBottom = '8px';
      showButtonLabel.style.marginTop = '12px';
      const showButtonCheck = document.createElement('input');
      showButtonCheck.type = 'checkbox';
      showButtonCheck.checked = showButton;
      showButtonCheck.addEventListener('change', () => dispatchConfigChanged(this, getConfig()));
      showButtonLabel.appendChild(showButtonCheck);
      showButtonLabel.appendChild(document.createTextNode('Button „Zur Vacuum-Karte“ anzeigen'));
      wrapper.appendChild(showButtonLabel);

      const buttonTextInput = document.createElement('input');
      buttonTextInput.type = 'text';
      buttonTextInput.value = buttonText;
      buttonTextInput.placeholder = BUTTON_TEXT_DEFAULT;
      buttonTextInput.style.cssText = inputStyle;
      buttonTextInput.addEventListener('input', () => dispatchConfigChanged(this, getConfig()));
      this._addField(wrapper, 'Button-Text', buttonTextInput, '20px');

      const info = document.createElement('div');
      info.style.marginTop = '20px';
      info.style.padding = '12px';
      info.style.background = 'var(--ha-card-background, var(--secondary-background-color))';
      info.style.borderRadius = '8px';
      info.style.fontSize = '13px';
      info.innerHTML = [
        '<p><strong>Hinweis:</strong> Die Vacuum-Karte (Dark/Hell, Raum-Dropdown, Status) ist eine <strong>Lovelace-View-Konfiguration</strong>, keine einzelne Karte.</p>',
        '<p>Bitte die Datei <code>vacuum-karte.yaml</code> aus dem Repository als neue View in dein Dashboard übernehmen und die Entity-IDs anpassen (siehe README).</p>'
      ].join('');
      wrapper.appendChild(info);

      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(wrapper);
    }
  }

  // ========== Karte ==========
  class CursorSaugroboterCard extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    getCardSize() {
      const c = this._config;
      let size = 3;
      if (c.view_path && c.show_view_button !== false) size += 1;
      return size;
    }

    _render() {
      if (!this._config) return;
      const c = this._config;
      const card = document.createElement('ha-card');
      card.header = c.title || CARD_TITLE_DEFAULT;
      const content = document.createElement('div');
      content.style.padding = '16px';
      content.style.lineHeight = '1.5';

      const parts = [
        '<p><strong>HACS-Installation erfolgreich.</strong></p>',
        '<p>Die Vacuum-Karte (Dark/Hell, Raum-Dropdown, Status) ist eine <strong>Lovelace-View-Konfiguration</strong>, keine einzelne Karte.</p>',
        '<p>Bitte die Datei <code>vacuum-karte.yaml</code> aus dem Repository als neue View in dein Dashboard übernehmen und die Entity-IDs anpassen (siehe README).</p>'
      ];

      const viewPath = (c.view_path || VIEW_PATH_DEFAULT).trim();
      const showButton = c.show_view_button !== false;
      const buttonText = (c.button_text || BUTTON_TEXT_DEFAULT).trim();

      if (viewPath && showButton) {
        const href = '/lovelace/' + viewPath.replace(/^\/+/, '');
        parts.push(
          '<p style="margin-top: 16px;">',
          '<a href="' + href + '" style="display: inline-block; padding: 10px 16px; background: var(--primary-color); color: var(--text-primary-color); text-decoration: none; border-radius: 8px; font-weight: 500;">' + (buttonText || BUTTON_TEXT_DEFAULT) + '</a>',
          '</p>'
        );
      }

      content.innerHTML = parts.join('');
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(card);
      card.appendChild(content);
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
        title: CARD_TITLE_DEFAULT,
        view_path: VIEW_PATH_DEFAULT,
        show_view_button: true,
        button_text: BUTTON_TEXT_DEFAULT
      };
    }
  }

  customElements.define('cursor-saugroboter-card-editor', CursorSaugroboterCardEditor);
  customElements.define('cursor-saugroboter-card', CursorSaugroboterCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'cursor-saugroboter-card',
    name: 'Cursor Saugroboter',
    description: 'Hinweis: Vacuum-View-Konfiguration siehe Repository (vacuum-karte.yaml)'
  });
})();
