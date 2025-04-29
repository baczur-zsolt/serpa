import { API_URL } from './config.js';
//Pagination

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let productsData = [];

//Felhasználók adatainak lekérése
//
//https://67bdcc05321b883e790df6fe.mockapi.io/api/users


//Felhasználók törlése a sorból az ikon megnyomásával
// Felhasználó törlése
/*
function deleteUser(selectedUserId) {
    if (selectedUserId) {
        fetch(`${API_URL}=${selectedUserId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.ok) {
                // Sor eltávolítása a DOM-ból
                document.querySelector(`tr[data-user-id="${selectedUserId}"]`)?.remove();
                console.log("Sikeresen eltávolítva")
            } else {
                alert("Sikertelen törlés");
            }
        })
        .catch(error => console.error("Hiba:", error))
        .finally(() => {
            document.getElementById("userDeleteModal").classList.add("hidden");
        });
    }
}
*/
//Felhasználói adatok módosítása




// Felhasználók törlése a sorból az ikon megnyomásával
/*
document.addEventListener("DOMContentLoaded", function () {
    let selectedUserId = null;

    // Delegált eseménykezelő a kukákhoz
    document.addEventListener("click", function (event) {
        let trashIcon = event.target.closest("a"); // Az <a> elemre figyelünk
        if (trashIcon && trashIcon.querySelector("svg")) {
            event.preventDefault(); // Ne navigáljon el a "#" miatt
            selectedUserId = trashIcon.getAttribute("data-user-id");

            // Modal megjelenítése
            document.getElementById("userDeleteModal").classList.remove("hidden");
        }
    });

    // Modal bezárása
    document.querySelectorAll("[data-modal-hide='userDeleteModal']").forEach(button => {
        
        button.addEventListener("click", function () {
            document.getElementById("userDeleteModal").classList.add("hidden");
        });
    });
    
    // Törlés megerősítése
    document.querySelector(".text-white.bg-blue-600").addEventListener("click", function () {
        deleteUser(selectedUserId); // Külön függvény meghívása
    });
});
*/

Promise.all([
    fetch(`${API_URL}employee`), // Sale adatok
    fetch(`${API_URL}product`) // Product adatok
  ])
    .then(([saleRes, productRes]) => {
      // Válaszok JSON formátumban
      return Promise.all([
        saleRes.json(),
        productRes.json()
      ]);
    })
    .then(([saleData, productData]) => {
      // Adatok eltárolása
      employeesData = saleData;
      productsData = productData;
  
      // Táblázat renderelése
      renderTable();
    })
    .catch(error => {
      console.error("Hiba a letöltésnél:", error);
    });
    
// 🔹 Táblázat frissítése az aktuális oldallal
function renderTable() {
    tableBody.innerHTML = "";  // Táblázat ürítése

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = employeesData.slice(start, end);

    paginatedItems.forEach(user => {
        // A termék információk hozzáadása
        const product = productsData.find(product => product.product_ID === user.product_ID);
        
    
        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.id = user.sale_ID;  // A data-id hozzáadása a sorhoz
    
        row.innerHTML = `

        
          <td class="hidden">${user.id}</td>
          <td class="px-6 py-4 text-center">${user.last_name + " " + user.first_name}</td>
          
          
          <td class="px-6 py-4 text-center">${user.status}</td>
          <td class="px-6 py-4 text-center">${user.job_position}</td>
          <td class="px-6 py-4 text-center">${user.phone_number}</td>
          <td class="px-6 py-4 text-center">${user.zipcode}</td>
          <td class="px-6 py-4 text-center">${user.address_city}</td>
          <td class="px-6 py-4 text-center">${user.address_street}</td>
          <td class="px-6 py-4 text-center">${user.address_number}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex justify-center gap-4">
            
              <!-- Edit gomb -->
              <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.sale_ID}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
              </button>
              <!-- Delete gomb -->
              <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.sale_ID}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
              </button>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      

        // 📌 Mobil verzióhoz tartozó kártya nézet (használjuk ugyanazokat a gombokat)
        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-lg p-4 border border-gray-200";
        card.innerHTML = `
            <div class="flex justify-between">
                
                <h3 class="text-lg font-semibold text-gray-900">${user.product_name}</h3>
                <div class="flex gap-2">
                    <!-- Mobil nézet: ugyanaz a gomb, mint a táblázatban -->
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.sale_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.sale_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Mennyiség: ${user.quantity_sale}</p>
            <p class="text-sm text-gray-500">Vétel ár: ${user.total_price}</p>
            <p class="text-sm text-gray-500">Eladási ár: ${user.sale_date}</p>
        `;
        mobileView.appendChild(card);
    });


        // Event delegation a táblázat soraiban
        tableBody.addEventListener("click", function(e) {
            if (e.target.closest(".edit-btn")) {
                const id = e.target.closest(".edit-btn").dataset.id;
                const item = employeesData.find(emp => emp.sale_ID == id);
                openEditModal(item);
            } else if (e.target.closest(".delete-btn")) {
                const id = e.target.closest(".delete-btn").dataset.id;
                deleteSale(id);
            }
        });

//PDF letöltés
        document.querySelectorAll('.pdfDownload-btn').forEach(button => {
            button.addEventListener('click', function() {
              const saleID = this.getAttribute('data-id');
          
              // Itt lekérheted az adott sorhoz tartozó adatokat (pl. product, quantity, price, stb.)
              // Ezután generálhatod a PDF-et és letöltheted
          
              const doc = new jsPDF();
          
              // Példa adat
              const productName = "Termék neve"; // Itt adhatod hozzá az adatokat, amik szükségesek
              const quantity = "Mennyiség";
              const price = "Ár";
          
              doc.setFontSize(16);
              doc.text("PDF generálás: " + productName, 20, 20);
              doc.setFontSize(12);
              doc.text(`Mennyiség: ${quantity}`, 20, 30);
              doc.text(`Ár: ${price}`, 20, 40);
          
              // PDF letöltés
              doc.save(`sale_${saleID}.pdf`);
            });
          });

function openEditModal(item) {
    // Feltételezzük, hogy minden input elem ID-ja megfelelő
    document.getElementById("editName").value = item.product_name;
    document.getElementById("editEmail").value = item.quantity_sale;
    document.getElementById("editStatus").value = item.total_price;

    // Mentéshez szükség lesz az ID-ra is, amit külön el kell tárolni
    document.getElementById("saveChanges").dataset.id = item.sale_ID;

    document.getElementById("editModal").classList.remove("hidden");
}

// Bezárás gomb
document.getElementById("closeUserSettingsMenuModal").addEventListener("click", () => {
    document.getElementById("editModal").classList.add("hidden");
});

// Mentés gomb esemény
document.getElementById("saveChanges").addEventListener("click", async function () {
    const id = this.dataset.id;
    const updatedData = {
        product_name: document.getElementById("editName").value,
        quantity_sale: parseInt(document.getElementById("editEmail").value),
        total_price: parseFloat(document.getElementById("editStatus").value),
        sale_date: document.getElementById("editPosition").value
    };
    

    const response = await fetch(`${API_URL}sale/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
        
    });
    console.log(updatedData);
    if (response.ok) {
        const index = employeesData.findIndex(emp => emp.sale_ID == id);
        employeesData[index] = { ...employeesData[index], ...updatedData };
        renderTable();
         // PDF generálása
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("PDF generálás: " + updatedData.product_name, 20, 20);
        doc.setFontSize(12);
        doc.text(`Mennyiség: ${updatedData.quantity_sale}`, 20, 30);
        doc.text(`Ár: ${updatedData.total_price}`, 20, 40);
        doc.text(`Dátum: ${updatedData.sale_date}`, 20, 50);

        // PDF letöltése
        doc.save(`sale_${id}.pdf`);
        document.getElementById("editModal").classList.add("hidden");
    } else {
        alert("Hiba a frissítés során!");
    }
});

// Törlés
async function deleteSale(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt az eladást?")) return;

    const response = await fetch(`${API_URL}sale/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        employeesData = employeesData.filter(emp => emp.sale_ID != id);
        renderTable();
    } else {
        alert("Hiba a törlés során!");
    }
}
// Például közvetlenül a script betöltésekor:
if (!window.mobileViewHandlerAdded) {
    mobileView.addEventListener("click", function(e) {
        if (e.target.closest(".edit-btn")) {
            const id = e.target.closest(".edit-btn").dataset.id;
            const item = employeesData.find(emp => emp.sale_ID == id);
            openEditModal(item);
        } else if (e.target.closest(".delete-btn")) {
            const id = e.target.closest(".delete-btn").dataset.id;
            deleteSale(id);
        }
    });
    window.mobileViewHandlerAdded = true; // jelölés, hogy már hozzád lett adva
}

        
        
        generatePageNumbers();
    }

function generatePageNumbers() {
    const totalPages = Math.ceil(employeesData.length / rowsPerPage);
    const pageNumbersDiv = document.getElementById("pageNumbers");

    pageNumbersDiv.innerHTML = ""; // Clear page numbers

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-button", "rounded-md", "border", "border-slate-300", "py-2", "px-3", "text-center", "text-sm", "transition-all", "shadow-sm", "hover:shadow-lg", "text-slate-600", "hover:text-white", "hover:bg-blue-600", "hover:border-blue-600", "focus:text-white", "focus:bg-blue-600", "focus:border-blue-600", "active:border-blue-600", "active:text-white", "active:bg-blue-800", "disabled:pointer-events-none", "disabled:opacity-50", "disabled:shadow-none", "ml-2");

        // Disable current page button
        if (i === currentPage) {
            pageButton.disabled = true;
            pageButton.classList.add("bg-blue-600", "text-white");
        } else {
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderTable();
            });
        }

        pageNumbersDiv.appendChild(pageButton);
    }
}

// 🔹 Következő oldal
function nextPage() {
    if (currentPage < Math.ceil(employeesData.length / rowsPerPage)) {
        currentPage++;
        renderTable();
    }
}

// 🔹 Előző oldal
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// 🔹 Első megjelenítés
renderTable();


document.getElementById("prevBtn").addEventListener("click", prevPage);
document.getElementById("nextBtn").addEventListener("click", nextPage);







//Alkalmazott felvétele Modal

// Gombok és a modal kiválasztása
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modal = document.getElementById('crud-modal');
const overlay = document.getElementById('overlay');
const userDeleteModal = document.getElementById('userDeleteModal');
const applyNewStaff = document.getElementById('applyNewStaff');


// Modal megnyitása
openModal.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Modal láthatóvá tétele
    modal.classList.add('flex'); // Modal láthatóvá tétele
    overlay.classList.remove('hidden');
    
    
});

// Modal bezárása
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden'); // Modal elrejtése
    overlay.classList.add('hidden');
    
});

// Bezárás, ha a felhasználó a háttérre kattint
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
});



    applyNewStaff.addEventListener("click", function () {
        modal.classList.add("hidden");
        overlay.classList.add('hidden');
        
    });









// Adatok szerkesztése "ceruza ikonnal"
/*
document.addEventListener("DOMContentLoaded", function () {
    let selectedUserId = null;

    // Delegált eseménykezelő a kukákhoz
    document.addEventListener("click", function (event) {
        let trashIcon = event.target.closest("a"); // Az <a> elemre figyelünk
        if (trashIcon && trashIcon.querySelector("svg")) {
            event.preventDefault(); // Ne navigáljon el a "#" miatt
            selectedUserId = trashIcon.getAttribute("data-user-id");

            // Modal megjelenítése
            document.getElementById("userDeleteModal").classList.remove("hidden");
            document.getElementById("userDeleteModaloverlay").classList.remove("hidden");
        }
    });

    // Modal bezárása
    document.querySelectorAll("[data-modal-hide='userDeleteModal']").forEach(button => {
        button.addEventListener("click", function () {
            document.getElementById("userDeleteModal").classList.add("hidden");
            document.getElementById("userDeleteModaloverlay").classList.add("hidden");
        });
    });

    // Törlés megerősítése
    document.querySelector(".text-white.bg-blue-600").addEventListener("click", function () {
        deleteUser(selectedUserId); // Külön függvény meghívása
    });
});
*/
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

   
  
        // Az aktuális sor kiválasztása
        let row = this.closest("tr");
  
        // Az összes szerkeszthető cella kiválasztása
        row.querySelectorAll("[data-editable='true']").forEach((cell) => {
          let text = cell.innerText.trim();
          let input = document.createElement("input");
          input.type = "text";
          input.value = text;
          input.className = "border px-2 py-1 w-full";
  
          // Ha elhagyja a mezőt, visszaállítja az új értéket
          input.addEventListener("blur", function () {
            cell.innerText = this.value;
          });
  
          cell.innerHTML = "";
          cell.appendChild(input);
          input.focus();
        });
      });
    });
  });
  

  /*

  document.addEventListener("DOMContentLoaded", function () {
    const editModal = document.getElementById("editModal");
    const saveChanges = document.getElementById("saveChanges");
    const closeUserSettingsMenuModal = document.getElementById("closeUserSettingsMenuModal");

    const tableBody = document.getElementById("employeesTable").querySelector("tbody"); // ez fontos!

    // Űrlap mezők
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editStatus = document.getElementById("editStatus");
    const editPosition = document.getElementById("editPosition");

    let editingRow = null;

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".edit-btn");

        if (button) {
            console.log("Szerkesztés gombra kattintottál!");
            editingRow = button.closest("tr");
            console.log(button.closest("tr"))

            if (editingRow) {
                console.log("Szerkesztett sor:", editingRow);

                editName.value = editingRow.querySelector("td:nth-child(2)").textContent.trim();
                editEmail.value = editingRow.querySelector("td:nth-child(3)").textContent.trim();
                editStatus.value = editingRow.querySelector("td:nth-child(4)").textContent.trim();
                editPosition.value = editingRow.querySelector("td:nth-child(5)").textContent.trim();

                editModal.classList.remove("hidden");
            } else {
                console.warn("Nem talált szerkeszthető sort!");
            }
        }
    });

    closeUserSettingsMenuModal.addEventListener("click", function () {
        editModal.classList.add("hidden");
    });


    saveChanges.addEventListener("click", function () {
        
        console.log("SaveChanges gombra kattintottál");
        console.log("editingRow:", editingRow); // EZT ADD HOZZÁ
        if (!editingRow) return;

        if (!editingRow) return;

    let fullName = editName.value.trim();
    let nameParts = fullName.split(" ");
    let lastName = nameParts[0] || "";
    let firstName = nameParts.slice(1).join(" ") || "";

    const updatedData = {
        id: editingRow.dataset.id, // A sor azonosítója
        last_name: lastName,
        first_name: firstName,
        
        email: editEmail.value,
        status: editStatus.value,
        access_level: editPosition.value
    };
    
        // Küldés a backendnek
        fetch(`${API_URL}sale/${editingRow.dataset.id}`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        
        .then(data => {
            console.log("Backend válasz:", data);
            if (data) {
                // A frontend frissítése
                
                editingRow.querySelector("td:nth-child(2)").textContent = updatedData.last_name + ' ' + updatedData.first_name;
                editingRow.querySelector("td:nth-child(3)").textContent = updatedData.email;
                editingRow.querySelector("td:nth-child(4)").textContent = updatedData.status;
                editingRow.querySelector("td:nth-child(5)").textContent = updatedData.access_level;
                
                editModal.classList.add("hidden");
                editingRow = null;
            } else {
                alert("Hiba történt a módosítás során!");
            }
        })
        .catch(error => console.error("Hiba:", error));
    });

    // **Eseménykezelő delegálása a táblázatra**

    document.addEventListener("DOMContentLoaded", () => {
        tableBody.addEventListener("click", function (event) {
            const button = event.target.closest(".delete-btn"); // Csak akkor fut tovább, ha delete-btn-re kattintottak
            if (!button) return;
    
            const saleId = button.getAttribute("data-id");
            if (!saleId) {
                console.error("Nincs érvényes sale_ID.");
                return;
            }
    
            const confirmDelete = confirm(`Biztosan törlöd az ID: ${saleId} rekordot?`);
            if (!confirmDelete) return;
    
            const row = button.closest("tr");
    
            fetch(`${API_URL}sale/${saleId}`, {
                method: "DELETE"
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Hiba történt a törlés során.");
                }
                return response.json();
            })
            .then(data => {
                console.log("Törlés sikeres:", data);
                if (row) row.remove(); // Sor eltávolítása, ha sikeres
            })
            .catch(error => {
                console.error("Hiba a törlés során:", error);
                alert("Hiba történt a törlés során.");
            });
        });
    });
    
});

*/





//Új alkalazott felvétele Modal logikája
// Új alkalmazott hozzáadása (POST)
// Az eseménykezelő a form submitjára

document.getElementById('applyNewStaff').addEventListener('click', function(event) {
    event.preventDefault();  // Megakadályozza, hogy a form alapértelmezetten újratöltse az oldalt

    
    /*
    const fullName = document.getElementById('newstaff_name').value; // Ha egyetlen mezőben van a teljes név
    const nameParts = fullName.split(" "); // A szóköz alapján szétválasztjuk (feltételezve, hogy csak két rész van, de ha több, akkor jobban kell kezelni)
    
    // Ha van első és utolsó név
    const first_name = nameParts[0]; 
    const last_name = nameParts[1] || ""; // Ha nincs utolsó név, akkor üres stringet adunk vissza
    
    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: document.getElementById('newstaff_email').value
    };

    // Hívjuk meg az addUser funkciót, hogy elküldje az adatokat

*/
    addUser(userData);

    document.getElementById('newstaff_name').value = "";
    document.getElementById('newstaff_email').value = "";
    
});

// Az addUser függvény, amely elküldi a POST kérést
//'../../backend/api.php?endpoint=staff'
function addUser(userData) {
    fetch(`${API_URL}sale`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Hiba a szerveren: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Backend válasz:", data);
        
        if (data && data.id) {  // Ellenőrizzük, hogy van-e releváns adat
            employeesData.unshift(data);  // Új adat hozzáadása
            renderTable();  // Táblázat frissítése
        } else {
            alert("Hiba történt a módosítás során! Hibás vagy hiányzó adatok.");
        }
    })
    .catch(error => {
        console.error('Hiba történt a felhasználó hozzáadásakor:', error);
        alert("Hiba történt a felhasználó hozzáadásakor. Kérlek, próbáld újra.");
    });
}



//Vevők dinamikus betöltése fetcheléssel

document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.getElementById("customerDropdownBtn");
    const dropdownOptions = document.getElementById("customerOptions");
    const selectedCustomer = document.getElementById("selectedCustomer");
    const customerInput = document.getElementById("customer_ID");
  
    // Toggle
    dropdownBtn.addEventListener("click", function (e) {
      e.preventDefault();
      dropdownOptions.classList.toggle("hidden");
    });
  
    
    document.addEventListener("click", function (e) {
      if (
        !dropdownBtn.contains(e.target) &&
        !dropdownOptions.contains(e.target)
      ) {
        dropdownOptions.classList.add("hidden");
      }
    });
  
    // Partner betöltés
    Promise.all([
      fetch(`${API_URL}sale`),
      fetch(`${API_URL}partner`),
      fetch(`${API_URL}product`),
    ])
      .then(([saleRes, partnerRes]) =>
        Promise.all([saleRes.json(), partnerRes.json()])
      )
      .then(([saleData, partnerData]) => {
        // Táblázat renderelés, ha kell
        if (typeof renderTable === "function") {
          window.employeesData = saleData;
          renderTable();
        }
  
        dropdownOptions.innerHTML = "";
  
        partnerData
  .filter(partner => partner.status === 0)
  .sort((a, b) => {
    const nameA = (a.name || `${a.last_name} ${a.first_name}`).toLowerCase();
    const nameB = (b.name || `${b.last_name} ${b.first_name}`).toLowerCase();
    return nameA.localeCompare(nameB);
  })
  .forEach((partner) => {
    const displayName =
      partner.name || `${partner.last_name} ${partner.first_name}`;
    const li = document.createElement("li");
    li.textContent = displayName;
    li.setAttribute("data-value", partner.partner_ID);
    li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
    li.addEventListener("click", function () {
      selectedCustomer.textContent = displayName;
      customerInput.value = partner.partner_ID;
      dropdownOptions.classList.add("hidden");
    });
    dropdownOptions.appendChild(li);
  });
      })
      .catch((error) => {
        console.error("Hiba az adatok betöltésekor:", error);
      });
  });


  document.addEventListener("DOMContentLoaded", function () {
    const productGrid = document.getElementById("productRows");
    const addProductButton = document.getElementById("addProductRow");
  
    // Termékek betöltése egyszer
    if (!window.productDataLoaded) {
      fetch(`${API_URL}product`)
        .then((res) => res.json())
        .then((productData) => {
          window.productData = productData;
          window.productDataLoaded = true;
          initAllDropdowns();
        })
        .catch((error) => {
          console.error("Hiba a termékek betöltésekor:", error);
        });
    } else {
      initAllDropdowns();
    }
  
    function initAllDropdowns() {
      const dropdownButtons = document.querySelectorAll(".productDropdownBtn");
      dropdownButtons.forEach(initDropdownLogic);
    }
  
    function initDropdownLogic(button) {
      const wrapper = button.closest(".flex-1");
      const options = wrapper.querySelector(".productOptions");
      const selectedProduct = button.querySelector(".selectedProduct");
      const productInput = wrapper.querySelector(".product_ID");
  
      button.addEventListener("click", function (e) {
        e.preventDefault();
        options.classList.toggle("hidden");
      });
  
      document.addEventListener("click", function (e) {
        if (!button.contains(e.target) && !options.contains(e.target)) {
          options.classList.add("hidden");
        }
      });
  
      fillDropdown(options, selectedProduct, productInput, window.productData, button);
    }
  
    function fillDropdown(options, selectedProduct, productInput, data, button) {
      options.innerHTML = "";
      data
        .sort((a, b) => a.product_name.localeCompare(b.product_name))
        .forEach((product) => {
          const li = document.createElement("li");
          li.textContent = product.product_name;
          li.setAttribute("data-value", product.product_ID);
          li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
  
          li.addEventListener("click", function () {
            selectedProduct.textContent = product.product_name;
            productInput.value = product.product_ID;
            options.classList.add("hidden");
          
            const fullRow = button.closest(".productRow");
            const priceInput = fullRow.querySelector('.productUnitPrice');
          
            console.log("Kiválasztott termék:", product.product_name);
            console.log("Ár:", product.product_profit_price);
            console.log("Talált input:", priceInput);
          
            if (priceInput && product.product_profit_price !== undefined) {
              priceInput.value = product.product_profit_price;
            }
          });
  
          options.appendChild(li);
        });
    }

  
    // Új terméksor hozzáadása
    addProductButton.addEventListener("click", function () {
      const newRow = document.createElement("div");
      newRow.className = "flex flex-col sm:flex-row gap-4 w-full";
  
      newRow.innerHTML = `
        <div class="flex-1 relative productRow">
          <label class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Termék neve</label>
          <button type="button" class="productDropdownBtn w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 relative">
            <span class="selectedProduct">Válassz terméket</span>
            <svg class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul class="productOptions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md text-sm hidden max-h-60 overflow-auto">
          </ul>
          <input type="hidden" name="product_ID[]" class="product_ID" required>
          <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
          <button type="button"  class="removeProductRow text-sm text-red-500 hover:underline mt-2">
                  - Termék eltávolítása
                </button>
        </div>
  
        <div class="flex-1">
          <label class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Mennyiség</label>
          <input type="number" name="quantity[]" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Mennyiség" required>
          <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
        </div>
  
        <div class="flex-1">
          <label class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Egységár</label>
          <input type="number" name="price[]" class="productUnitPrice  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Egységár" disabled>
          <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
        </div>
      `;
  
      productGrid.appendChild(newRow);
  
      // Inicializáljuk az új dropdown-t
      const newButton = newRow.querySelector(".productDropdownBtn");
      initDropdownLogic(newButton);
      // Hozzáadjuk az eseményfigyelőt a törlés gombhoz
  const removeButton = newRow.querySelector(".removeProductRow");
  removeButton.addEventListener("click", function () {
    newRow.remove();
        });
    });
  });
