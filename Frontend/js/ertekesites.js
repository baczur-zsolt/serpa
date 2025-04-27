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
      productsData = productData;
  
      // Táblázat renderelése
      renderTable();
    })
    .catch(error => {
      console.error("Hiba a letöltésnél:", error);
    });
    
// 🔹 Táblázat frissítése az aktuális oldallal
function renderDesktopView() {
  tableBody.innerHTML = "";  // Táblázat ürítése
  mobileView.innerHTML = ""; // Mobil nézet elrejtése (opcionális)

  let start = (currentPage - 1) * rowsPerPage;
  let end = start + rowsPerPage;
  let paginatedItems = employeesData.slice(start, end);

  paginatedItems.forEach(user => {
      const customer = productsData.find(p => p.customer_ID === user.customer_ID);
      const customerName = customer ? `${customer.last_name} ${customer.first_name}` : "N/A";
      const customerStatus = customer 
          ? (customer.status === 0 ? "Vásárló" : "Eladó") 
          : "N/A";
      
      let row = document.createElement("tr");
      row.classList.add("hover:bg-gray-100");
      row.id = user.sale_ID;

      row.innerHTML = `
          <td class="hidden">${user.id}</td>
          <td class="px-6 py-4">${user.bill_number}</td>
          <td class="px-6 py-4">${customerStatus}</td>
          <td class="px-6 py-4">${user.sale_date}</td>
          <td class="px-6 py-4">${customerName}</td>
          <td class="px-6 py-4">${user.total_price + " HUF"}</td>
          <td class="px-6 py-4">
              <div class="flex justify-center gap-4">
                  <button class="view-btn desktop-view-btn" view-bill="${user.bill_number}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                  </button>
                  <button class="download-btn desktop-download-btn" data-bill="${user.bill_number}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z"/></svg>
                  </button>
                  <button class="edit-btn desktop-edit-btn text-blue-600 hover:text-blue-800"" data-id="${user.sale_ID}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  </button>
                  <button class="delete-btn desktop-delete-btn text-red-600 hover:text-red-800"" data-id="${user.sale_ID}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/></svg>
                  </button>
              </div>
          </td>
      `;
      tableBody.appendChild(row);
  });
}

function renderMobileView() {
  mobileView.innerHTML = ""; // Mobil nézet ürítése
  tableBody.innerHTML = "";  // Táblázat elrejtése (opcionális)

  let start = (currentPage - 1) * rowsPerPage;
  let end = start + rowsPerPage;
  let paginatedItems = employeesData.slice(start, end);

  paginatedItems.forEach(user => {
      const customer = productsData.find(p => p.customer_ID === user.customer_ID);
      const customerName = customer ? `${customer.last_name} ${customer.first_name}` : "N/A";
      const customerStatus = customer 
          ? (customer.status === 0 ? "Vásárló" : "Eladó") 
          : "N/A";
      
      const card = document.createElement("div");
      card.className = "bg-white shadow-md rounded-lg p-4 border border-gray-200";
      card.innerHTML = `
          <div class="flex justify-between">
              <h3 class="text-lg font-semibold text-gray-900">${user.bill_number}</h3>
              <div class="flex gap-2">
                  <button class="view-btn mobile-view-btn" view-bill="${user.bill_number}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                  </button>
                  <button class="download-btn mobile-download-btn" data-bill="${user.bill_number}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z"/></svg>
                  </button>
                  <button class="edit-btn mobile-edit-btn text-blue-600 hover:text-blue-800""  data-id="${user.sale_ID}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  </button>
                  <button class="delete-btn mobile-delete-btn text-red-600 hover:text-red-800"" data-id="${user.sale_ID}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/></svg>
                  </button>
              </div>
          </div>
          <p class="text-sm text-gray-500">Típus: ${customerStatus}</p>
          <p class="text-sm text-gray-500">Számla dátuma: ${user.sale_date}</p>
          <p class="text-sm text-gray-500">Partner: ${customerName}</p>
          <p class="text-sm text-gray-500">Összeg: ${user.total_price + " HUF"}</p>
      `;
      mobileView.appendChild(card);
  });
}

function renderTable() {
  if (window.innerWidth <= 768) {
      renderMobileView();
  } else {
      renderDesktopView();
  }
}


Promise.all([
  fetch(`${API_URL}sale`),
  fetch(`${API_URL}partner`)
])
.then(([saleRes, productRes]) => {
  return Promise.all([saleRes.json(), productRes.json()]);
})
.then(([saleData, productData]) => {
  employeesData = saleData;
  productsData = productData;
  renderTable(); // Itt már a módosított renderTable hívódik
})
.catch(error => {
  console.error("Hiba a letöltésnél:", error);
});

// ablak átméretezés figyelő
window.addEventListener('resize', () => {
  renderTable();
});

//Event delegation a különböző gombokhoz
document.addEventListener('click', function(event) {
  // Letöltés gombok
  const downloadBtn = event.target.closest('.download-btn');
  if (downloadBtn) {
      const billNumber = downloadBtn.getAttribute('data-bill');
      downloadInvoice(billNumber);
      return;
  }

  // Megtekintés gombok
  const viewBtn = event.target.closest('.view-btn');
  if (viewBtn) {
      const billNumber = viewBtn.getAttribute('view-bill');
      const formattedBillNumber = billNumber.slice(8);
      const url = `http://localhost/serpa/invoice/${formattedBillNumber}`;
      window.open(url, '_blank');
      return;
  }

  // Szerkesztés gombok
  const editBtn = event.target.closest('.edit-btn');
  if (editBtn) {
      const saleId = editBtn.getAttribute('data-id');
      // Itt hívd meg a szerkesztés függvényed
      editSale(saleId);
      return;
  }

  // Törlés gombok
  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
      const saleId = deleteBtn.getAttribute('data-id');
      // Itt hívd meg a törlés függvényed
      deleteSale(saleId);
      return;
  }
});

// Letöltő függvény
function downloadInvoice(billNumber) {
  if (!billNumber) {
      console.error("Hiba: billNumber nincs megadva");
      return;
  }

  const formattedBillNumber = billNumber.slice(8);
  const url = `${API_URL}invoice/${formattedBillNumber}`;

  fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error(`Hiba a számla letöltésekor: ${response.statusText}`);
          }
          return response.blob();
      })
      .then(blob => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `szamla_${formattedBillNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(error => {
          console.error("Hiba:", error);
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
const applyNewStaffForm = document.getElementById('applyNewStaffForm');

// Modal megnyitása
openModal.addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  overlay.classList.remove('hidden');
});

// Modal bezárása
closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
});

// Bezárás, ha háttérre kattint
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
  }
});

// Form submit kezelés
applyNewStaffForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Eladó és Vevő adatok
  const sellerID = formData.get('staff_ID');
  const customerID = formData.get('customer_ID');
  const productIDs = formData.getAll('product_ID[]');
  const quantities = formData.getAll('quantity[]');
  const prices = formData.getAll('price[]');

  // Hibák törlése induláskor
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(error => error.remove());

  const allInputs = form.querySelectorAll('input, select');
  allInputs.forEach(input => {
    input.classList.remove('border-red-500');
  });

  let formIsValid = true;

  // Vevő ellenőrzése
  const customerSelect = document.getElementById('customer_ID');

  if (!customerSelect || !customerSelect.value) {
    showError(customerSelect, 'Kötelező kiválasztani egy vevőt!');
    isValid = false;
  }

  // Termékek ellenőrzése
  const productInputs = form.querySelectorAll('input[name="product_ID[]"]');
  productInputs.forEach(input => {
    if (!input.value.trim()) {
      showError(input, 'Kötelező megadni a terméket!');
      formIsValid = false;
    }
  });

  // Mennyiségek ellenőrzése
  const quantityInputs = document.querySelectorAll('input[name="quantity[]"]');
quantityInputs.forEach((input) => {
  if (!input.value) {
    showError(input, 'Kötelező mező!');
    isValid = false;
  }
});

  if (!formIsValid) {
    return; // Nem megy tovább, ha hiba van
  }

  // Ha minden jó, bezárjuk a modalt és elküldjük az adatokat
  const userData = {
    sellerID: sellerID,
    customerID: customerID,
    products: productIDs,
    quantities: quantities,
    prices: prices
  };

  try {
    await addUser(userData);
    alert('Felhasználó sikeresen hozzáadva!');
    modal.classList.add('hidden'); // Modal bezárása csak siker esetén
    overlay.classList.add('hidden');
  } catch (err) {
    console.error(err);
    alert('Hiba történt a felhasználó hozzáadásakor.');
  }
});





// Gombok és a modal kiválasztása
const openBuyingModal = document.getElementById('openBuyingModal');
const closeBuyingModal = document.getElementById('closeBuyingModal');
const buyingModal = document.getElementById('buying-crud-modal');
const BuyingOverlay = document.getElementById('BuyingOverlay');
const apllyNewBuying = document.getElementById('apllyNewBuying');


// Modal megnyitása
openBuyingModal.addEventListener('click', () => {
    buyingModal.classList.remove('hidden'); // Modal láthatóvá tétele
    buyingModal.classList.add('flex'); // Modal láthatóvá tétele
    BuyingOverlay.classList.remove('hidden');
    
    
});

// Modal bezárása
closeBuyingModal.addEventListener('click', () => {
    buyingModal.classList.add('hidden'); // Modal elrejtése
    BuyingOverlay.classList.add('hidden');
    
});

// Bezárás, ha a felhasználó a háttérre kattint
buyingModal.addEventListener('click', (e) => {
    if (e.target === buyingModal) {
        buyingModal.classList.add('hidden');
        BuyingOverlay.classList.add('hidden');
    }
});



    applyNewStaff.addEventListener("click", function () {
        buyingModal.classList.add("hidden");
        BuyingOverlay.classList.add('hidden');
        
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
document.getElementById('applyNewStaffForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Eladó ID kinyerése
    const sellerID = formData.get('staff_ID');
    const customerID = formData.get('customer_ID');
    const productIDs = formData.getAll('product_ID[]');
    const quantities = formData.getAll('quantity[]');
    const prices = formData.getAll('price[]');

    // Hibák törlése induláskor
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());

    const allInputs = form.querySelectorAll('input, select');
    allInputs.forEach(input => {
      input.classList.remove('border-red-500');
    });

    let formIsValid = true;
    

   // Termékek ellenőrzése
   const customerInputs = form.querySelectorAll('input[name="customer_ID[]"]');
   customerInputs.forEach(input => {
     if (!input.value.trim()) {
       showError(input, 'Kötelező megadni a terméket!!!');
       formIsValid = false;
     }
   });



    // Termékek ellenőrzése
    const productInputs = form.querySelectorAll('input[name="product_ID[]"]');
    productInputs.forEach(input => {
      if (!input.value.trim()) {
        showError(input, 'Kötelező megadni a terméket!!!');
        formIsValid = false;
      }
    });

    // Mennyiségek ellenőrzése
    const quantityInputs = form.querySelectorAll('input[name="quantity[]"]');
    quantityInputs.forEach(input => {
      if (!input.value.trim() || parseInt(input.value) <= 0) {
        showError(input, 'Kötelező megadni helyes mennyiséget!');
        formIsValid = false;
      }
    });

    if (!formIsValid) {
      return; // Nem küldjük el, ha hiba van
    }

    const userData = {
      sellerID: sellerID,
      customerID: customerID,
      products: productIDs,
      quantities: quantities,
      prices: prices
    };

    try {
      await addUser(userData);
      alert('Felhasználó sikeresen hozzáadva!');
    } catch (err) {
      console.error(err);
      alert('Hiba történt a felhasználó hozzáadásakor.');
    }
  });

function showError(input, message) {
  input.classList.add('border', 'border-red-500');

  const error = document.createElement('p');
  error.textContent = message;
  error.classList.add('text-red-500', 'text-sm', 'mt-1', 'error-message');

  input.parentNode.appendChild(error);
}



// Az addUser függvény, amely elküldi a POST kérést
function addUser(userData) {
    return fetch(`${API_URL}sale`, {
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
            // Ha szükséges, itt dolgozhatsz a felhasználói adatokkal
            // employeesData.unshift(data);  // Új adat hozzáadása
            // renderTable();  // Táblázat frissítése
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

        //a vevők ABC sorrendbe helyezése a legördülő menüben

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
