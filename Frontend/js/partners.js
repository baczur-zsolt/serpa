import { API_URL } from './config.js';
//Pagination

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let partnersData = [];

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
    fetch(`${API_URL}sale`), // Sale adatok
    fetch(`${API_URL}partner`) // Product adatok
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
      partnersData = productData;
  
      // Táblázat renderelése // új adat a tömb elejére

// Rendezés dátum (stamp) alapján – legújabb előre
partnersData.sort((a, b) => new Date(b.stamp) - new Date(a.stamp));

renderTable();
console.log(employeesData.map(e => e.stamp));
console.log("Első elem:", employeesData[0]);
    })
    .catch(error => {
      console.error("Hiba a letöltésnél:", error);
    });
    
// 🔹 Táblázat frissítése az aktuális oldallal
function renderTable() {
    tableBody.innerHTML = "";  // Táblázat ürítése
    mobileView.innerHTML = ""; // Mobil verzió ürítése, hogy ne duplázódjanak a kártyák

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = partnersData.slice(start, end);

    paginatedItems.forEach(user => {
        // A termék információk hozzáadása
        const product = partnersData.find(product => product.customer_ID === user.customer_ID);
        if (!product) {
            console.warn("Hiányzó termék az alábbi product_ID alapján:", user.customer_ID);
        }
        const productName = product ? product.product_name : "N/A"; // Ha nincs találat, "N/A" jelenik meg

        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.id = user.customer_ID;  // A data-id hozzáadása a sorhoz

        row.innerHTML = `
            <td class="hidden">${user.id}</td>
            <td class="px-6 py-4">${product.last_name + ' ' + product.first_name}</td>
            <td class="px-6 py-4">${product.email}</td>
            <td class="px-6 py-4">${product.tax_number}</td>
            <td class="px-6 py-4">
  ${product.status == 1 ? "Beszállító" : "Magánszemély"}
</td>
            <td class="px-6 py-4">${product.zipcode}</td>
            <td class="px-6 py-4">${product.address_city}</td>
            <td class="px-6 py-4">${product.address_street}</td>
            <td class="px-6 py-4">${product.address_number}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    <!-- Edit gomb -->
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.product_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <!-- Delete gomb -->
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.product_ID}">
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
                <h3 class="text-lg font-semibold text-gray-900">${product.last_name + ' ' + product.first_name}</h3>
                <div class="flex gap-2">
                    <!-- Mobil nézet: ugyanaz a gomb, mint a táblázatban -->
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${product.email}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.product_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Adószám: ${product.tax_number}</p>
            <p class="text_sm">${product.status == 1 ? "Beszállító" : "Magánszemély"}</p>
            <p class="text-sm text-gray-500">Irányítószám: ${product.zipcode}</p>
            <p class="text-sm text-gray-500">Város: ${product.address_city}</p>
            <p class="text-sm text-gray-500">utca: ${product.address_street}</p>
            <p class="text-sm text-gray-500">Házszám: ${product.address_number}</p>
        `;
        mobileView.appendChild(card); // Kártyák hozzáadása a mobil nézethez
    });



        

        

// Bezárás gomb
document.getElementById("closeUserSettingsMenuModal").addEventListener("click", () => {
    document.getElementById("editModal").classList.add("hidden");
});

// Mentés gomb esemény
document.getElementById("saveChanges").addEventListener("click", async function () {
    const id = this.dataset.id;
    const updatedData = {
        product_name: document.getElementById("editName").value,
        stock_number: document.getElementById("editEmail").value,
        product_price: document.getElementById("editPosition").value,
        product_profit_price: document.getElementById("editStatus").value
    };
    

    const response = await fetch(`${API_URL}product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
        
    });
    console.log(updatedData);
    console.log("stock_number:", document.getElementById("editEmail").value);
console.log("product_price:", document.getElementById("editPosition").value);
console.log("product_profit_price:", document.getElementById("editStatus").value);
    if (response.ok) {
        const index = partnersData.findIndex(emp => emp.customer_ID == id);
        partnersData[index] = { ...partnersData[index], ...updatedData };
        renderTable();
        document.getElementById("editModal").classList.add("hidden");
    } else {
        alert("Hiba a frissítés során!");
    }
    document.getElementById("editEmail").addEventListener("input", function () {
        console.log("editEmail változott:", this.value);
    });
});


// Például közvetlenül a script betöltésekor:
if (!window.mobileViewHandlerAdded) {
    mobileView.addEventListener("click", function(e) {
        if (e.target.closest(".edit-btn")) {
            const id = e.target.closest("tr").id;
const item = partnersData.find(emp => emp.customer_ID == id);
            console.log("EDIT ITEM:", item);
            if (!item) {
                console.log("Nincs átadott partner!");
            }
            openEditModal(item);
        } else if (e.target.closest(".delete-btn")) {
            const id = e.target.closest(".delete-btn").dataset.id;
            deleteSale(id);
        }
    });
    window.mobileViewHandlerAdded = true;
}

        
        
        generatePageNumbers();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'  // Aktiválja a sima görgetést
        });
    }

    function openEditModal(partner) {
        console.log("EDIT PARTNER:", partner);
    
        if (!partner) {
            console.warn("Nincs átadott partner!");
            return;
        }
    
        // Input mezők feltöltése partner adataival
        document.getElementById("editName").value = partner.first_name || "";
        document.getElementById("editEmail").value = partner.email || "";
        document.getElementById("editPosition").value = partner.tax_number || "";
        document.getElementById("editStatus").value = partner.phone || "";
    
        // Elmentjük az ID-t, hogy tudjuk, mit frissítsünk
        document.getElementById("saveChanges").dataset.id = partner.customer_ID;
    
        // Modal megjelenítése
        document.getElementById("editModal").classList.remove("hidden");
    }
    

// Törlés
async function deleteSale(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a terméket?")) return;

    const response = await fetch(`${API_URL}sale/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        employeesData = employeesData.filter(emp => emp.product_ID != id);
        renderTable();
    } else {
        alert("Hiba a törlés során!");
    }
}

// Event delegation a táblázat soraiban
tableBody.addEventListener("click", function(e) {
    if (e.target.closest(".edit-btn")) {
        const id = e.target.closest(".edit-btn").dataset.id;
        console.log("Kattintott ID:", id);
        const item = partnersData.find(emp => emp.product_ID == id);
        console.log("partnersData:", partnersData);
        openEditModal(item);
    } else if (e.target.closest(".delete-btn")) {
        const id = e.target.closest(".delete-btn").dataset.id;
        deleteSale(id);
    }
});

function generatePageNumbers() {
    const totalPages = Math.ceil(partnersData.length / rowsPerPage);
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
    document.body.classList.add('overflow-hidden');
    
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
                console.error("Nincs érvényes product_ID.");
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
    event.preventDefault(); // Ne küldje el az űrlapot alapértelmezetten

    const requiredFields = [
        'newstaff_name',
        'newstaff_email',
        'newstaff_phone_number',
        'newstaff_address_zipcode',
        'newstaff_address_city',
        'newstaff_address_street',
        'newstaff_address_housenumber',
        'newstaff_status' // Új mező hozzáadása a validáláshoz
    ];

    let formIsValid = true;

    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const errorSpan = input.parentElement.querySelector('.error-message'); // Itt keresünk a parent elemen belül

        if (fieldId === 'newstaff_status') {
            // Ha select mezőt validálunk
            if (input.value === '' || input.value === 'Válasszon típust') {
                errorSpan.classList.remove('hidden'); // Hibajelzés megjelenítése
                formIsValid = false;
            } else {
                errorSpan.classList.add('hidden'); // Hibajelzés elrejtése
            }
        } else {
            // Ha nem select, akkor a megszokott validálás
            if (!input.value.trim()) {
                errorSpan.classList.remove('hidden'); // Hibajelzés megjelenítése
                formIsValid = false;
            } else {
                errorSpan.classList.add('hidden'); // Hibajelzés elrejtése
            }
        }
    });

    if (!formIsValid) {
        return; // Ne folytassa a beküldést, ha a form nem érvényes
    }

    const fullName = document.getElementById('newstaff_name').value.trim();
    const nameParts = fullName.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ") || "";

    // Státusz kiválasztása
    const status = document.getElementById('newstaff_status').value === 'Vevő' ? true : false;

    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: document.getElementById('newstaff_email').value,
        tax_number: document.getElementById('newstaff_phone_number').value,
        status: status, // A kiválasztott státusz beállítása
        zipcode: document.getElementById('newstaff_address_zipcode').value,
        address_city: document.getElementById('newstaff_address_city').value,
        address_street: document.getElementById('newstaff_address_street').value,
        address_number: document.getElementById('newstaff_address_housenumber').value
    };

    // Hívjuk az addUser függvényt, hogy elküldjük az adatokat
    addUser(userData); 

    // űrlap ürítése
    document.getElementById('applyNewStaffForm').reset();

    // Ha minden mező érvényes, akkor zárjuk be a modalt és az overlayt
    if (formIsValid) {
        const modal = document.getElementById('crud-modal');
        const overlay = document.getElementById('overlay');
        modal.classList.add("hidden");
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden'); // Görgetés visszaállítása
    }
});


function addUser(userData) {
    fetch(`${API_URL}partner`, {
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

        // Ha az új felhasználó sikeresen létrejött
        const newUser = Array.isArray(data) ? data[0] : data;

        if (newUser?.customer_ID) {
            // Hozzáadjuk az új felhasználót a listához
            partnersData.unshift(newUser); // új felhasználó a lista elejére

            // Újra rendereljük a táblázatot, hogy az új adat azonnal megjelenjen
            renderTable();
        } else {
            alert("Hiba történt a felhasználó hozzáadásakor! Ellenőrizd az adatokat.");
        }
    })
    .catch(error => {
        console.error('Hiba történt a felhasználó hozzáadásakor:', error);
        alert("Hiba történt a felhasználó hozzáadásakor. Kérlek, próbáld újra.");
    });
}






