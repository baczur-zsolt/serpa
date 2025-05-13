import { API_URL } from './config.js';

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let partnersData = [];




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
console.log(partnersData.map(e => e.stamp));
console.log("Első elem:", partnersData[0]);
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
        const product = partnersData.find(product => product.customer_ID === user.customer_ID);
        if (!product) {
            console.warn("Hiányzó termék az alábbi product_ID alapján:", user.customer_ID);
        }
        const productName = product ? product.product_name : "N/A";

        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.id = user.customer_ID;  // A data-id hozzáadása a sorhoz

        row.innerHTML = `
            <td class="hidden">${user.id}</td>
            <td class="px-6 py-4">${product.last_name + ' ' + product.first_name}</td>
            <td class="px-6 py-4">${product.email}</td>
            <td class="px-6 py-4">${product.tax_number}</td>
            <td class="px-6 py-4">${product.status == 1 ? "Beszállító" : "Magánszemély"}</td>
            <td class="px-6 py-4">${product.zipcode}</td>
            <td class="px-6 py-4">${product.address_city}</td>
            <td class="px-6 py-4">${product.address_street}</td>
            <td class="px-6 py-4">${product.address_number}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.customer_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
			<path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
						</svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.customer_ID}">
                         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-lg p-4 border border-gray-200";
        card.setAttribute("data-id", user.customer_ID); 
        card.innerHTML = `
            <div class="flex justify-between">
                <h3 class="text-lg font-semibold text-gray-900">${product.first_name + ' ' + product.last_name}</h3>
                <div class="flex gap-2">
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.customer_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
			<path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
						</svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.customer_ID}">
                         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Adószám: ${product.tax_number}</p>
            <p class="text_sm">${product.status == 1 ? "Beszállító" : "Magánszemély"}</p>
            <p class="text-sm text-gray-500">Irányítószám: ${product.zipcode}</p>
            <p class="text-sm text-gray-500">Város: ${product.address_city}</p>
            <p class="text-sm text-gray-500">Utca: ${product.address_street}</p>
            <p class="text-sm text-gray-500">Házszám: ${product.address_number}</p>
        `;
        mobileView.appendChild(card); // Kártyák hozzáadása a mobil nézethez
    });

document.getElementById("closeUserSettingsMenuModal").addEventListener("click", () => {
    document.getElementById("editModal").classList.add("hidden");
});


        
        generatePageNumbers();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

// Törlés
document.addEventListener("DOMContentLoaded", function () {
    const deleteModal = document.getElementById("deleteModal"); // Ha szükséges modal, de alapvetően alert is elég
    const tableBody = document.getElementById("employeesTable").querySelector("tbody");
    const mobileView = document.getElementById("mobileView");

    // Törlés eseménykezelés asztali nézethez
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".delete-btn");

        if (button) {
            const id = button.dataset.id;
            const partner = partnersData.find(emp => emp.customer_ID == id);
            if (partner) {
                deleteUser(partner);
            }
        }
    });

    // Törlés eseménykezelés mobil nézethez
    if (!window.mobileViewHandlerAdded) {
        mobileView.addEventListener("click", function(e) {
            const deleteBtn = e.target.closest(".delete-btn");
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                const partner = partnersData.find(emp => emp.customer_ID == id);
                deleteUser(partner);
            }
        });
        window.mobileViewHandlerAdded = true;
    }

    // Törlés logika
    function deleteUser(partner) {
        if (!partner) {
            console.warn("Nincs átadott partner!");
            return;
        }
    
        const confirmation = confirm(`Biztosan törölni szeretnéd a következő felhasználót: ${partner.last_name} ${partner.first_name}?`);
    
        if (confirmation) {
            // Törlés az adatbázisból
            deleteUserFromDatabase(partner.customer_ID);
    
            // Törlés a frontenden asztali nézetben
            const row = document.querySelector(`[data-id='${partner.customer_ID}']`).closest('tr');
            if (row) {
                row.remove();
            }
    
            // Törlés a mobil nézetben
            const mobileCard = document.querySelector(`[data-id='${partner.customer_ID}']`);
            if (mobileCard) {
                mobileCard.remove();
            }
        }
    }

    async function deleteUserFromDatabase(id) {
        const response = await fetch(`${API_URL}partner/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            console.log(`Felhasználó törölve: ${id}`);
        } else {
            alert("Hiba történt a törlés során!");
            console.error(await response.text());
        }
    }
});

function generatePageNumbers() {
    const totalPages = Math.ceil(partnersData.length / rowsPerPage);
    const pageNumbersDiv = document.getElementById("pageNumbers");

    pageNumbersDiv.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-button", "rounded-md", "border", "border-slate-300", "py-2", "px-3", "text-center", "text-sm", "transition-all", "shadow-sm", "hover:shadow-lg", "text-slate-600", "hover:text-white", "hover:bg-blue-600", "hover:border-blue-600", "focus:text-white", "focus:bg-blue-600", "focus:border-blue-600", "active:border-blue-600", "active:text-white", "active:bg-blue-800", "disabled:pointer-events-none", "disabled:opacity-50", "disabled:shadow-none", "ml-2");

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

function nextPage() {
    if (currentPage < Math.ceil(employeesData.length / rowsPerPage)) {
        currentPage++;
        renderTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

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
    modal.classList.remove('hidden');
    modal.classList.add('flex');
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

    const tableBody = document.getElementById("employeesTable").querySelector("tbody");
    const mobileView = document.getElementById("mobileView"); // ID, amit használsz a mobilos listához

    // Űrlap mezők
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editTaxnumber = document.getElementById("editTaxnumber");
    const editType = document.getElementById("editType");
    const editZipcode = document.getElementById("editZipcode");
    const editCity = document.getElementById("editCity");
    const editStreet = document.getElementById("editStreet");
    const editHousenumber = document.getElementById("editHousenumber");

    let editingRow = null;

    // ASZTALI nézethez
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".edit-btn");

        if (button) {
            const id = button.dataset.id;
const partner = partnersData.find(emp => emp.customer_ID == id);
if (partner) {
    openEditModal(partner);
}
        }
    });

    // MOBIL nézethez
    mobileView.addEventListener("click", function(e) {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const id = editBtn.dataset.id;
            const partner = partnersData.find(emp => emp.customer_ID == id);
            if (partner) {
                openEditModal(partner);
            }
        }
    });

    function openEditModal(partner) {
        if (!partner) {
            console.warn("Nincs átadott partner!");
            return;
        }

        const fullName = `${partner.last_name || ""} ${partner.first_name || ""}`.trim();
        editName.value = fullName;
        editEmail.value = partner.email || "";
        editTaxnumber.value = partner.tax_number || "";
        editType.value = partner.status == 1 ? "1" : "0";
        editZipcode.value = partner.zipcode || "";
        editCity.value = partner.address_city || "";
        editStreet.value = partner.address_street || "";
        editHousenumber.value = partner.address_number || "";

        saveChanges.dataset.id = partner.customer_ID;

        editModal.classList.remove("hidden");
    }

    closeUserSettingsMenuModal.addEventListener("click", function () {
        editModal.classList.add("hidden");
    });

    saveChanges.addEventListener("click", async function () {
        const id = this.dataset.id;

        const fullName = editName.value.trim();
        const nameParts = fullName.split(" ");
        const lastName = nameParts[0] || "";
        const firstName = nameParts.slice(1).join(" ") || "";

        const updatedData = {
            last_name: lastName,
            first_name: firstName,
            email: editEmail.value,
            tax_number: editTaxnumber.value,
            status: editType.value === "1",
            zipcode: editZipcode.value,
            address_city: editCity.value,
            address_street: editStreet.value,
            address_number: editHousenumber.value
        };

        console.log("Küldött adat:", updatedData);

        const response = await fetch(`${API_URL}partner/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const index = partnersData.findIndex(emp => emp.customer_ID == id);
            if (index !== -1) {
                partnersData[index] = { ...partnersData[index], ...updatedData };
                renderTable();
            }
            editModal.classList.add("hidden");
        } else {
            alert("Hiba a frissítés során!");
            console.error(await response.text());
        }
    });
});


document.getElementById('applyNewStaff').addEventListener('click', function(event) {
    event.preventDefault();

    const requiredFields = [
        'newstaff_name',
        'newstaff_email',
        'newstaff_phone_number',
        'newstaff_address_zipcode',
        'newstaff_address_city',
        'newstaff_address_street',
        'newstaff_address_housenumber',
        'newstaff_status'
    ];

    let formIsValid = true;

    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const errorSpan = input.parentElement.querySelector('.error-message'); 

        if (fieldId === 'newstaff_status') {
            // Ha select mezőt validálunk
            if (input.value === '' || input.value === 'Válasszon típust') {
                errorSpan.classList.remove('hidden'); 
                formIsValid = false;
            } else {
                errorSpan.classList.add('hidden'); 
            }
        } else {

            if (!input.value.trim()) {
                errorSpan.classList.remove('hidden'); 
                formIsValid = false;
            } else {
                errorSpan.classList.add('hidden'); 
            }
        }
    });

    if (!formIsValid) {
        return; 
    }

    const fullName = document.getElementById('newstaff_name').value.trim();
const nameParts = fullName.split(" ");
const last_name = nameParts[0];
const first_name = nameParts.slice(1).join(" ") || "";


    const status = document.getElementById('newstaff_status').value === '1' ? true : false;

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


        const newUser = Array.isArray(data) ? data[0] : data;

        if (newUser?.customer_ID) {

            partnersData.unshift(newUser); 
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






