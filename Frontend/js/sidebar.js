


//oldalsáv almenük nyitása/zárása

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-dropdown-toggle]");
    if (target) {
      const menuId = target.dataset.dropdownToggle;
      const arrowId = target.dataset.arrowToggle;
      const submenu = document.getElementById(menuId);
      const arrow = document.getElementById(arrowId);
      if (submenu) submenu.classList.toggle("hidden");
      if (arrow) arrow.classList.toggle("rotate-0");
    }
  });
});
  
  // Oldalsáv megnyitása/zárása
  function Openbar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("-translate-x-full");
  }
  
  
  
  
  
  
   const hamburgerMenu = document.getElementById('hamburger-menu');
   const sidebar = document.getElementById('sidebar');
  
   hamburgerMenu.addEventListener('click', () => {
  
  sidebar.classList.toggle('hidden'); // Mobilnézetben rejtett vagy látható
  });
  
  document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
  
   const target = event.target.closest("[data-dropdown-toggle]");
   if (target) {
       
      
  
       
  
       
       event.stopPropagation();
      }
      
  });
  });
  
  
  function toggleDropdown() {
       document.getElementById("myDropdown").classList.toggle("hidden");
   }
  
   
   window.onclick = function(event) {
  if (!event.target.closest('.text-white')) {
   var dropdowns = document.getElementsByClassName("dropdown-content");
   for (var i = 0; i < dropdowns.length; i++) {
       var openDropdown = dropdowns[i];
       if (!openDropdown.classList.contains('hidden')) {
           openDropdown.classList.add('hidden');
       }
   }
  }
  };
  
  
  