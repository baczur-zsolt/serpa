// frontend/js/topnavbar.js
class TopNavbar extends HTMLElement {
    constructor() {
      super();
  
      // Shadow DOM létrehozása
      const shadow = this.attachShadow({ mode: 'open' });
  
      // Sablon betöltése
      const template = document.getElementById('topnavbar-template').content.cloneNode(true);
  
      // Sablon hozzáadása a Shadow DOM-hoz
      shadow.appendChild(template);
  
      // Itt adhatsz hozzá extra JS-t az interaktivitáshoz
      console.log('TopNavbar component loaded!');
    }
  }
  
  // Custom Element regisztrálása
  customElements.define('top-navbar', TopNavbar);
  