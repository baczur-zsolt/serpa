
async function loadHTML() {
    try {
        // Sidebar betöltése
        const sidebarResponse = await fetch('/vizsgamunka/frontend/components/sidebar.html');
        const sidebarHTML = await sidebarResponse.text();
        document.getElementById('sidebar-container').innerHTML = sidebarHTML;

        // Sidebar eseménykezelők inicializálása
        initializeSidebarDropdown();

        // Topnavbar betöltése
        const topnavbarResponse = await fetch('/vizsgamunka/frontend/components/topnavbar.html');
        const topnavbarHTML = await topnavbarResponse.text();
        document.getElementById('topnavbar-container').innerHTML = topnavbarHTML;

    } catch (error) {
        console.error('Hiba a fájlok betöltésekor:', error);
    }
}

// Almenük működésének beállítása
function initializeSidebarDropdown() {
    document.addEventListener("click", (event) => {
        const target = event.target.closest("[data-dropdown-toggle]");
        if (target) {
            const menuId = target.dataset.dropdownToggle;
            const submenu = document.getElementById(menuId);
            if (submenu) {
                submenu.classList.toggle("hidden");
            }

            // Bezárás más dropdown-ok esetében
            const dropdowns = document.querySelectorAll(".dropdown-content");
            dropdowns.forEach((dropdown) => {
                if (dropdown !== submenu && !dropdown.classList.contains("hidden")) {
                    dropdown.classList.add("hidden");
                }
            });
        }
    });
}

// A loadHTML függvény meghívása
loadHTML();
