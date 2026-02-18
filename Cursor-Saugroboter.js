// Cursor Saugroboter – HACS-kompatible Lovelace-Info-Karte mit visuellem Editor
// Die eigentliche Vacuum-Karte ist die YAML-View (vacuum-karte.yaml). Siehe README.

(function() {
  const CARD_TITLE_DEFAULT = 'Cursor Saugroboter';

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

    _render() {
      if (!this.shadowRoot) return;
      const title = this._config.title || CARD_TITLE_DEFAULT;

      const wrapper = document.createElement('div');
      wrapper.style.padding = '16px';
      wrapper.style.lineHeight = '1.5';

      const headline = document.createElement('h3');
      headline.style.marginTop = '0';
      headline.textContent = 'Cursor Saugroboter – Konfiguration';
      wrapper.appendChild(headline);

      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '8px';
      label.style.fontWeight = '500';
      label.textContent = 'Titel der Karte';
      wrapper.appendChild(label);

      const input = document.createElement('input');
      input.type = 'text';
      input.value = title;
      input.placeholder = CARD_TITLE_DEFAULT;
      input.style.cssText = 'width: 100%; max-width: 400px; padding: 8px 12px; margin-bottom: 16px; box-sizing: border-box; font-size: 14px;';
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: { ...this._config, title: input.value || undefined } },
          bubbles: true,
          composed: true
        }));
      });
      wrapper.appendChild(input);

      const info = document.createElement('div');
      info.style.marginTop = '16px';
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
      return 3;
    }

    _render() {
      if (!this._config) return;
      const card = document.createElement('ha-card');
      card.header = this._config.title || CARD_TITLE_DEFAULT;
      const content = document.createElement('div');
      content.style.padding = '16px';
      content.style.lineHeight = '1.5';
      content.innerHTML = [
        '<p><strong>HACS-Installation erfolgreich.</strong></p>',
        '<p>Die Vacuum-Karte (Dark/Hell, Raum-Dropdown, Status) ist eine <strong>Lovelace-View-Konfiguration</strong>, keine einzelne Karte.</p>',
        '<p>Bitte die Datei <code>vacuum-karte.yaml</code> aus dem Repository als neue View in dein Dashboard übernehmen und die Entity-IDs anpassen (siehe README).</p>'
      ].join('');
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(card);
      card.appendChild(content);
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._render();
    }

    // Visueller Editor: Konfigurations-Element für Lovelace
    static getConfigElement() {
      return document.createElement('cursor-saugroboter-card-editor');
    }

    // Standard-Konfiguration für den Karten-Picker
    static getStubConfig() {
      return { title: CARD_TITLE_DEFAULT };
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
