
//Pagination

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];

//Felhasználók adatainak lekérése
//../../backend/api.php?endpoint=staff
fetch('https://dummyjson.com/users')
    .then(res => res.json())
    .then(data => {
        console.log(data);
        employeesData = data.users; // Adatok eltárolása
        renderTable();
    })
    .catch(error => console.error("Hiba a letöltésnél:", error));

//Felhasználók törlése a sorból az ikon megnyomásával
// Felhasználó törlése
function deleteUser(selectedUserId) {
    if (selectedUserId) {
        fetch(`https://dummyjson.com/products=${selectedUserId}`, {
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

//Felhasználói adatok módosítása




// Felhasználók törlése a sorból az ikon megnyomásával
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


// 🔹 Táblázat frissítése az aktuális oldallal
function renderTable() {
    tableBody.innerHTML = "";
    mobileView.innerHTML = ""; // 📌 Mobil nézet törlése az új adatok előtt

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = employeesData.slice(start, end);

    paginatedItems.forEach(user => {
        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");

        row.id = user.id;

        row.innerHTML = `
            <td class="px-6 py-4">${user.email}</td>
            <td class="px-6 py-4">${user.firstName + " " + user.lastName}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">${user.price}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.id}">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // 📌 Mobil verzióhoz tartozó kártya nézet
        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-lg p-4 border border-gray-200";
        card.innerHTML = `
            <div class="flex justify-between">
                <h3 class="text-lg font-semibold text-gray-900">${user.firstName}</h3>
                <div class="flex gap-2">
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.id}">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Mennyiség: ${user.stock}</p>
            <p class="text-sm text-gray-500">Vétel ár: ${user.price}</p>
            <p class="text-sm text-gray-500">Eladási ár: ${user.price}</p>
        `;
        mobileView.appendChild(card);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // 📌 Event Listener-ek optimalizálása
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", openEditModal);
    });

    document.getElementById("closeUserSettingsMenuModal").addEventListener("click", closeEditModal);

    generatePageNumbers();
}

// 📌 Funkció a szerkesztő modal megnyitására
function openEditModal() {
    let userId = this.dataset.id;
    let user = employeesData.find(emp => emp.id == userId);

    if (user) {
        document.getElementById("editName").value = user.product_name;
        document.getElementById("editEmail").value = user.number;
        document.getElementById("editStatus").value = user.purchase_price;
        document.getElementById("editPosition").value = user.sale_price;

        document.getElementById("editModal").classList.remove("hidden");
    }
}

// 📌 Funkció a szerkesztő modal bezárására
function closeEditModal() {
    document.getElementById("editModal").classList.add("hidden");
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
const applyNewProduct = document.getElementById('applyNewProduct');


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



applyNewProduct.addEventListener("click", function () {
        modal.classList.add("hidden");
        overlay.classList.add('hidden');
    });









// Adatok szerkesztése "ceruza ikonnal"
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
  

  document.addEventListener("DOMContentLoaded", function () {
    const editModal = document.getElementById("editModal");
    const saveChanges = document.getElementById("saveChanges");
    const closeUserSettingsMenuModal = document.getElementById("closeUserSettingsMenuModal");
    const tableBody = document.getElementById("employeesTable");

    // Űrlap mezők
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editStatus = document.getElementById("editStatus");
    const editPosition = document.getElementById("editPosition");
    const editPhone = document.getElementById("editPhone");
    const editZip = document.getElementById("editZip");
    const editCity = document.getElementById("editCity");
    const editStreet = document.getElementById("editStreet");
    const editHouse = document.getElementById("editHouse");

    let editingRow = null;

    // **Eseménykezelő delegálása a táblázatra**
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".edit-btn");
        if (!button) return;

        editingRow = button.closest("tr");

        // Az adatokat beállítjuk az űrlap mezőkbe
        editName.value = editingRow.querySelector("td:nth-child(3)").textContent.trim();
        editEmail.value = editingRow.querySelector("th .text-gray-400").textContent.trim();

        const statusText  = editingRow.querySelector("td:nth-child(4) span").textContent.trim();
        // Státusz kiválasztása a select-ben
        const editStatusOption = Array.from(editStatus.options).find(option => option.textContent.trim() === statusText);
        if (editStatusOption) {
            editStatus.value = editStatusOption.value;
        }


        const positionText = editingRow.querySelector("td:nth-child(5)").textContent.trim();
        // Beosztás kiválasztása a select-ben
        const editPositionOption = Array.from(editPosition.options).find(option => option.textContent.trim() === positionText);
        if (editPositionOption) {
            editPosition.value = editPositionOption.value;
        }

        editPhone.value = editingRow.querySelector("td:nth-child(6)").textContent.trim();
        editZip.value = editingRow.querySelector("td:nth-child(7)").textContent.trim();
        editCity.value = editingRow.querySelector("td:nth-child(8)").textContent.trim();
        editStreet.value = editingRow.querySelector("td:nth-child(9)").textContent.trim();
        editHouse.value = editingRow.querySelector("td:nth-child(10)").textContent.trim();

        // Modal megjelenítése
        editModal.classList.remove("hidden");
    });

    // Modal bezárása
    closeUserSettingsMenuModal.addEventListener("click", function () {
        editModal.classList.add("hidden");
    });

    saveChanges.addEventListener("click", function () {
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
        status: editStatus.options[editStatus.selectedIndex].textContent,
        access_level: editPosition.options[editPosition.selectedIndex].textContent,
        phone_number: editPhone.value,
        address_zipcode: editZip.value,
        address_city: editCity.value,
        address_street: editStreet.value,
        address_housenumber: editHouse.value
    };
    
        // Küldés a backendnek
        fetch(`https://dummyjson.com/products/${editingRow.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        
        .then(data => {
            console.log("Backend válasz:", data);
            if (data) {
                // A frontend frissítése
                
                editingRow.querySelector("td:nth-child(3)").textContent = updatedData.last_name + ' ' + updatedData.first_name;
                editingRow.querySelector("th .text-gray-400").textContent = updatedData.email;
                editingRow.querySelector("td:nth-child(4) span").textContent = updatedData.status;
                editingRow.querySelector("td:nth-child(5)").textContent = updatedData.access_level;
                editingRow.querySelector("td:nth-child(6)").textContent = updatedData.phone_number;
                editingRow.querySelector("td:nth-child(7)").textContent = updatedData.address_zipcode;
                editingRow.querySelector("td:nth-child(8)").textContent = updatedData.address_city;
                editingRow.querySelector("td:nth-child(9)").textContent = updatedData.address_street;
                editingRow.querySelector("td:nth-child(10)").textContent = updatedData.address_housenumber;
                
                editModal.classList.add("hidden");
                editingRow = null;
            } else {
                alert("Hiba történt a módosítás során!");
            }
        })
        .catch(error => console.error("Hiba:", error));
    });

    // **Eseménykezelő delegálása a táblázatra**
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".delete-btn"); // Ellenőrizzük, hogy a kattintás a törlés gombon történt-e
        if (!button) return;

        const row = button.closest("tr"); // Megkeressük a táblázatsort
        const userId = row.id; // Az azonosító kinyerése

        if (!userId) {
            console.error("Nincs érvényes ID az elemhez.");
            return;
        }

        if (confirm("Biztosan törölni szeretnéd ezt az elemet?")) {
            // Küldés a backendnek DELETE kéréssel
            fetch(`https://dummyjson.com/products/${userId}`, {
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
                row.remove(); // Ha sikeres a törlés, eltávolítjuk a sort a táblázatból
            })
            .catch(error => {
                console.error("Hiba a törlés során:", error);
                alert("Hiba történt a törlés során.");
            });
        }
    });
    
});





//Új alkalazott felvétele Modal logikája
// Új alkalmazott hozzáadása (POST)
// Az eseménykezelő a form submitjára
document.getElementById('applyNewProduct').addEventListener('click', function(event) {
    event.preventDefault();  // Megakadályozza, hogy a form alapértelmezetten újratöltse az oldalt

    

    const fullName = document.getElementById('newstaff_name').value; // Ha egyetlen mezőben van a teljes név
    const nameParts = fullName.split(" "); // A szóköz alapján szétválasztjuk (feltételezve, hogy csak két rész van, de ha több, akkor jobban kell kezelni)
    
    // Ha van első és utolsó név
    const first_name = nameParts[0]; 
    const last_name = nameParts[1] || ""; // Ha nincs utolsó név, akkor üres stringet adunk vissza
    
    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: document.getElementById('newstaff_email').value,
        phone_number: document.getElementById('newstaff_phone_number').value,
        address_zipcode: document.getElementById('newstaff_address_zipcode').value,
        address_city: document.getElementById('newstaff_address_city').value,
        address_street: document.getElementById('newstaff_address_street').value,
        address_housenumber: document.getElementById('newstaff_address_housenumber').value,
        status: document.getElementById('newstaff_status').options[document.getElementById('newstaff_status').selectedIndex].textContent,
        access_level: document.getElementById('newstaff_access_level').options[document.getElementById('newstaff_access_level').selectedIndex].textContent,
    };

    // Hívjuk meg az addUser funkciót, hogy elküldje az adatokat
    addUser(userData);
});

// Az addUser függvény, amely elküldi a POST kérést
//'../../backend/api.php?endpoint=staff'
function addUser(userData) {
    fetch(`https://dummyjson.com/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)  // A felhasználó adatai JSON formátumban
    })
    .then(response => response.json())  // Feltételezve, hogy a backend JSON válaszokat küld
    .then(data => {
        console.log('Felhasználó sikeresen hozzáadva:', data);
        console.log("Backend válasz:", data);
            if (data) {
                // A frontend frissítése
                
                renderTable();
            } else {
                alert("Hiba történt a módosítás során!");
            }
        employeesData.push(data);  // Új adat hozzáadása a tárolt felhasználókhoz
        renderTable();  // Frissítjük a táblázatot
    })
    .catch(error => {
        console.error('Hiba történt a felhasználó hozzáadásakor:', error);
    });
    
    
}







