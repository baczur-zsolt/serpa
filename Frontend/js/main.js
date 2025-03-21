document.addEventListener('DOMContentLoaded', function() {
    // Dinamikusan betöltjük a topnavbar tartalmát
    fetch('../components/topnavbar.html')
      .then(response => response.text())
      .then(data => {
        const container = document.getElementById('topnavbar');
        container.innerHTML = data;
        runScripts(container); // Futassuk a betöltött script elemeket
      });
  
    // Dinamikusan betöltjük a sidebar tartalmát
    fetch('../components/sidebar.html')
      .then(response => response.text())
      .then(data => {
        const container = document.getElementById('sidebar');
        container.innerHTML = data;
        runScripts(container); // Futassuk a betöltött script elemeket
      });
  });
  
  // Függvény a script elemek futtatásához
  function runScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        // Ha a script külső forrásból származik (src attribútum)
        newScript.src = script.src;
      } else {
        // Ha inline script
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript); // Futtatjuk a scriptet
      document.body.removeChild(newScript); // Takarítjuk (opcionális)
    });
  }
  