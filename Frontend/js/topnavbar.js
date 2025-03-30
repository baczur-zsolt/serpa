import { API_URL } from './config.js';

//oldalsáv almenük nyitása/zárása


  
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
  
  
  



// Név beírása jobb felső sarokba
document.addEventListener("DOMContentLoaded", function(){
    
  const namespace=document.getElementById('namespace');

  function loadPage(){
      fetch(`${API_URL}username`)
      .then(response=>{
          if (!response.ok) {
              throw new Error("Nem sikerült a lekérdezés!");
          }
          return response.json();
      })
      .then(data=>{
          namespace.innerHTML=data[0]['last_name'] + " " + data[0]['first_name'] ;
      })
      .catch((error) => {
          alert(error);
      })           
  }

  loadPage();
});

document.addEventListener("DOMContentLoaded", function() {
    const accessLevelElement = document.getElementById('access_level');

    function loadAccessLevel() {
        fetch(`${API_URL}access_level`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.response === "success") {
                accessLevelElement.innerHTML = data.role_name;
            } else {
                accessLevelElement.innerHTML = "Hiba történt: " + data.message;
            }
        })
        .catch((error) => {
            accessLevelElement.innerHTML = "Hálózati hiba történt!";
            console.error(error);
        });           
    }

    loadAccessLevel();
});

  


