// Cursor Saugroboter – HACS-kompatible Lovelace-Info-Karte
// Die eigentliche Vacuum-Karte ist die YAML-View (vacuum-karte.yaml). Siehe README.

class CursorSaugroboterCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
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
    card.header = 'Cursor Saugroboter';
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
}

customElements.define('cursor-saugroboter-card', CursorSaugroboterCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cursor-saugroboter-card',
  name: 'Cursor Saugroboter',
  description: 'Hinweis: Vacuum-View-Konfiguration siehe Repository (vacuum-karte.yaml)'
});
