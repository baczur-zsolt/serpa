import { API_URL } from './config.js';

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let productsData = [];


Promise.all([
    fetch(`${API_URL}sale`), // Sale adatok
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
      productsData = productData.filter(product => product.status === 1);
  
      renderTable();
    })
    .catch(error => {
      console.error("Hiba a letöltésnél:", error);
    });
    
function renderTable() {
    productsData.sort((a, b) => b.product_ID - a.product_ID);
    tableBody.innerHTML = "";  // Táblázat ürítése
    mobileView.innerHTML = ""; // Mobil verzió ürítése, hogy ne duplázódjanak a kártyák

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = productsData.slice(start, end);

    paginatedItems.forEach(user => {
        // A termék információk hozzáadása
        const product = productsData.find(product => product.product_ID === user.product_ID);
        if (!product) {
            console.warn("Hiányzó termék az alábbi product_ID alapján:", user.product_ID);
        }
        const productName = product ? product.product_name : "N/A"; // Ha nincs találat, "N/A" jelenik meg

        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.id = user.product_ID;  // A data-id hozzáadása a sorhoz

        row.innerHTML = `
            <td class="hidden">${user.id}</td>
            <td class="px-6 py-4">${productName}</td>
            <td class="px-6 py-4">${product.stock_number}</td>
            <td class="px-6 py-4">${product.product_price}</td>
            <td class="px-6 py-4">${product.product_profit_price}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    <!-- Edit gomb -->
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.product_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    </button>
                    <!-- Delete gomb -->
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.product_ID}">
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
        card.innerHTML = `
            <div class="flex justify-between">
                <h3 class="text-lg font-semibold text-gray-900">${productName}</h3>
                <div class="flex gap-2">
                    <!-- Mobil nézet: ugyanaz a gomb, mint a táblázatban -->
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.product_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
			<path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
						</svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.product_ID}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Mennyiség: ${product.stock_number}</p>
            <p class="text-sm text-gray-500">Beszerzési ár: ${product.product_price}</p>
            <p class="text-sm text-gray-500">Eladási ár: ${product.product_profit_price}</p>
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
        stock_number: parseInt(document.getElementById("editEmail").value),
        product_price: parseInt(document.getElementById("editPosition").value),
        product_profit_price: parseInt(document.getElementById("editStatus").value)
    };
    

    const response = await fetch(`${API_URL}product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
        
    });
    if (response.ok) {
        const index = productsData.findIndex(emp => emp.product_ID == id);
        productsData[index] = { ...productsData[index], ...updatedData };
        renderTable();
        document.getElementById("editModal").classList.add("hidden");
    } else {
        alert("Hiba a frissítés során!");
    }
    document.getElementById("editEmail").addEventListener("input", function () {
        
    });
});


if (!window.mobileViewHandlerAdded) {
    mobileView.addEventListener("click", function(e) {
        if (e.target.closest(".edit-btn")) {
            const id = e.target.closest(".edit-btn").dataset.id;
            const item = productsData.find(emp => emp.product_ID == id);
            openEditModal(item);
        } else if (e.target.closest(".delete-btn")) {
            const id = e.target.closest(".delete-btn").dataset.id;
            deleteSale(id);
        }
    });
    window.mobileViewHandlerAdded = true; // jelölés, hogy már hozzád lett adva
}

        
        
        generatePageNumbers();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'  // Aktiválja a sima görgetést
        });
    }

    function openEditModal(item) {
        console.log("EDIT ITEM:", item);
    
        const product = productsData.find(prod => prod.product_ID == item.product_ID);

        document.getElementById("editName").value = product?.product_name || "";
        document.getElementById("editEmail").value = product?.stock_number || "";
        document.getElementById("editPosition").value = product?.product_price || "";
        document.getElementById("editStatus").value = product?.product_profit_price || "";
    
        document.getElementById("saveChanges").dataset.id = item.product_ID;
    
        document.getElementById("editModal").classList.remove("hidden");
    }

// Törlés
async function deleteSale(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a terméket?")) return;

    const response = await fetch(`${API_URL}product/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        // Frissítjük a terméklistát, hogy ne tartalmazza a törölt elemet
        productsData = productsData.filter(product => product.product_ID != id);

        // Újrarendereljük a táblázatot
        renderTable();
    } else {
        alert("Hiba a törlés során!");
    }
}

// Event delegation a táblázat soraiban
tableBody.addEventListener("click", function(e) {
    if (e.target.closest(".edit-btn")) {
        const id = e.target.closest(".edit-btn").dataset.id;
        const item = productsData.find(emp => emp.product_ID == id);
        openEditModal(item);
    } else if (e.target.closest(".delete-btn")) {
        const id = e.target.closest(".delete-btn").dataset.id;
        deleteSale(id);
    }
});

function generatePageNumbers() {
    const totalPages = Math.ceil(productsData.length / rowsPerPage);
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
document.getElementById('closeModal').addEventListener('click', function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");

    // Hibaüzenetek törlése
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // Mezők törlése
    ['product_name', 'quantity', 'purchase_price', 'selling_price'].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.body.classList.remove('overflow-hidden');
});

// Bezárás, ha a felhasználó a háttérre kattint
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
});

applyNewStaff.addEventListener("click", function (event) {
    event.preventDefault();

    // Töröljük az előző hibaüzeneteket
    document.querySelectorAll('.error-message').forEach(el => el.remove());


    let isValid = true;

    const fields = [
        { id: 'product_name', name: 'Név' },
        { id: 'quantity', name: 'Mennyiség' },
        { id: 'purchase_price', name: 'Beszerzési ár' },
        { id: 'selling_price', name: 'Eladási ár' }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input.value.trim()) {
            isValid = false;

            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                const errorP = document.createElement('p');
                errorP.classList.add('error-message');
                errorP.style.color = 'red';
                errorP.style.fontSize = '0.9em';
                errorP.textContent = 'Mező kitöltése kötelező';
                input.insertAdjacentElement('afterend', errorP);
            }
        }
    });

    if (!isValid) return; // Ha hiba van, ne menjen tovább és NE zárja be a modált

    // Csak itt zárjuk be, ha minden mező jó
    modal.classList.add("hidden");
    overlay.classList.add("hidden");

    // Elküldés
    const fullName = document.getElementById('product_name').value;
    const nameParts = fullName.trim().split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts[1] || "";

    const userData = {
        first_name,
        last_name,
        quantity: document.getElementById('quantity').value,
        purchase_price: document.getElementById('purchase_price').value,
        selling_price: document.getElementById('selling_price').value
    };

    addUser(userData);

    // Mezők törlése
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        input.value = "";
    
        const next = input.nextElementSibling;
        if (next && next.classList.contains('error-message')) {
            next.remove(); // töröljük a hozzá tartozó hibaüzenetet
        }
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
  

// Az addUser függvény, amely elküldi a POST kérést
function addUser() {
    // Az input mezőkből olvassuk ki az adatokat
    const productData = {
        product_name: document.getElementById('product_name').value,          // input mező: 'product_name'
        product_price: parseInt(document.getElementById('purchase_price').value, 10),  // input mező: 'product_price', integer
        product_profit_price: parseInt(document.getElementById('selling_price').value, 10),  // input mező: 'product_profit_price', integer
        stock_number: parseInt(document.getElementById('quantity').value, 10),  // input mező: 'stock_number', integer
        status: true  // fixen true, ahogy kérted
    };

    fetch(`${API_URL}product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)  // A felépített adatot küldjük
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Hiba a szerveren: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Backend válasz:", data);

        // Ha sikeres beszúrás, új terméket hozzáadunk a listához
        if (data && data.length > 0) {
            productsData.unshift(data[0]);  // pl. productsData a termékek listája
            renderTable();  // táblázat frissítése
        } else {
            alert("Hiba történt a termék hozzáadásakor! Ellenőrizd az adatokat.");
        }
    })
    .catch(error => {
        console.error('Hiba történt a termék hozzáadásakor:', error);
        alert("Hiba történt a termék hozzáadásakor. Kérlek, próbáld újra.");
    });
}


