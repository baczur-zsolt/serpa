import { API_URL } from './config.js';

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let originalEmail = ""


fetch(`${API_URL}employee`)
  .then(res => res.json())
  .then(saleData => {
    // Adatok eltárolása
    employeesData = saleData;

    // Táblázat renderelése
    renderTable();
  })
  .catch(error => {
    console.error("Hiba a letöltésnél:", error);
  });

function renderTable() {
  tableBody.innerHTML = ""; // Táblázat ürítése
  mobileView.innerHTML = ""; // Mobil nézet ürítése (ha szükséges)

  let start = (currentPage - 1) * rowsPerPage;
  let end = start + rowsPerPage;
  let filteredEmployees = employeesData.filter(user => user.status === 1);
let paginatedItems = [...filteredEmployees].reverse().slice(start, end);

  paginatedItems.forEach(user => {
    let row = document.createElement("tr");
    row.classList.add("hover:bg-gray-100");
    row.id = user.staff_ID;

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
          <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.staff_ID}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
			<path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
						</svg>
          </button>
          <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.staff_ID}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);

    // Mobil nézet
    const card = document.createElement("div");
    card.className = "bg-white shadow-md rounded-lg p-4 border border-gray-200";
    card.innerHTML = `
      <div class="flex justify-between">
        <h3 class="text-lg font-semibold text-gray-900">${user.last_name + " " + user.first_name}</h3>
        <div class="flex gap-2">
          <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.staff_ID}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
			<path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
						</svg>
          </button>
          <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.staff_ID}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-500">Státusz: ${user.status}</p>
      <p class="text-sm text-gray-500">Beosztás: ${user.job_position}</p>
      <p class="text-sm text-gray-500">Telefonszám: ${user.phone_number}</p>
      <p class="text-sm text-gray-500">Irányítószám: ${user.zipcode}</p>
      <p class="text-sm text-gray-500">Város: ${user.address_city}</p>
      <p class="text-sm text-gray-500">Utca: ${user.address_street}</p>
      <p class="text-sm text-gray-500">Házszám: ${user.address_number}</p>
    `;
    mobileView.appendChild(card);
  });

  // Event delegation
  tableBody.addEventListener("click", function (e) {
    if (e.target.closest(".edit-btn")) {
      const id = e.target.closest(".edit-btn").dataset.id;
      const item = employeesData.find(emp => emp.sale_ID == id);
      openEditModal(item);
    } else if (e.target.closest(".delete-btn")) {
      const id = e.target.closest(".delete-btn").dataset.id;
      deleteSale(id);
    }
  });


function openEditModal(item) {
  document.getElementById("editName").value;
  document.getElementById("editEmail").value;
  document.getElementById("saveChanges").dataset.id;
  document.getElementById("editModal").classList.remove("hidden");
}

// Bezárás gomb
document.getElementById("closeUserSettingsMenuModal").addEventListener("click", () => {
  document.getElementById("editModal").classList.add("hidden");
});



// Törlés
async function deleteSale(id) {
    if (!confirm("Biztosan inaktiválni szeretnéd ezt az alkalmazottat?")) return;

    const response = await fetch(`${API_URL}employee/${id}`, {
        method: "PUT", // vagy "PATCH" az API-tól függően
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: false })// csak a státuszt módosítjuk
    });

    if (response.ok) {
        const employee = employeesData.find(emp => emp.staff_ID == id);
        if (employee) {
            employee.status = 0;
        }

        const activeEmployees = employeesData.filter(emp => emp.status == 1);
        renderTable(activeEmployees);
    } else {
        alert("Hiba az inaktiválás során!");
    }
}

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
    window.mobileViewHandlerAdded = true;
}

        
        
        generatePageNumbers();
    }

function generatePageNumbers() {
    const totalPages = Math.ceil(employeesData.length / rowsPerPage);
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


//Új alkalazott felvétele Modal logikája

document.getElementById('applyNewStaff').addEventListener('click', function(event) {
    event.preventDefault();

    const fields = [
        { id: 'newstaff_name', errorId: 'error_name' }, 
        { id: 'newstaff_email', errorId: 'error_email' },
        { id: 'newstaff_password', errorId: 'error_password' },
        { id: 'newstaff_access_level', errorId: 'error_position' },
        { id: 'newstaff_phone_number', errorId: 'error_phonenumber' },
        { id: 'newstaff_address_zipcode', errorId: 'error_zipcode' },
        { id: 'newstaff_address_city', errorId: 'error_city' },
        { id: 'newstaff_address_street', errorId: 'error_street' },
        { id: 'newstaff_address_housenumber', errorId: 'error_housenumber' },
        { id: 'newstaff_superbrutto', errorId: 'error_superbrutto' },
        { id: 'newstaff_birthdate', errorId: 'error_birthdate' },
    ];

    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.errorId);

        if (!input || input.value === "" || input.value === "Válasszon" || 
            (input.type === "number" && isNaN(input.valueAsNumber))) {
            error.classList.remove('hidden');
            isValid = false;
        } else {
            error.classList.add('hidden');
        }
    });

    if (!isValid) return;

    const fullName = document.getElementById('newstaff_name').value.trim();
    const nameParts = fullName.split(" ");
    const last_name = nameParts[0] || "";
    const first_name= nameParts.slice(1).join(" ") || "";

    const accessLevelMap = {
        "4": 4, "3": 3, "2": 2, "1": 1
    };

    const job_positionMap = {
        "4": "Adminisztrátor",
        "3": "Vezető",
        "2": "Vezető Eladó",
        "1": "Eladó"
    };
    
    const selectedRole = document.getElementById('newstaff_access_level').value;
    const mappedAccessLevel = accessLevelMap[selectedRole] || 0;

    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: document.getElementById('newstaff_email').value,
        password: document.getElementById('newstaff_password').value,
        birthdate: document.getElementById('newstaff_birthdate').value,
        job_position: job_positionMap[selectedRole],
        access_level: mappedAccessLevel,
        zipcode: document.getElementById('newstaff_address_zipcode').value,
        address_city: document.getElementById('newstaff_address_city').value,
        address_street: document.getElementById('newstaff_address_street').value,
        address_number: document.getElementById('newstaff_address_housenumber').value,
        phone_number: document.getElementById('newstaff_phone_number').value,
        superbrutto: parseInt(document.getElementById('newstaff_superbrutto').value),
        status: true,
        qualification_ID: 1
    };

    fetch(`${API_URL}employee`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(res => res.json())
    .then(data => {
        console.log('Szerver válasz:', data);
    
        if (data.response === 'error' && data.message === 'Létező e-mail cím!') {
            const emailError = document.getElementById('error_email');
            emailError.textContent = data.message;
            emailError.classList.remove('hidden');
            return;
        }
    
        // Mivel a válasz egy tömb, az első elemet kell hozzáadni
        if (data && data.length > 0) {
            employeesData.push(data[0]);  // Az első alkalmazott adatainak hozzáadása
            clearFormFields();
            modal.classList.add('hidden');
            overlay.classList.add('hidden');
            renderTable();  // Táblázat frissítése
        } else {
            console.error("Hiba: a válaszban nincs adat.");
        }
    })
    .catch(err => {
        console.error("Hiba a fetch-ben:", err);
    });
});

// Figyeljük az e-mail mező változását, hogy eltüntessük a hibaüzenetet
document.getElementById('newstaff_email').addEventListener('input', function () {
    const emailError = document.getElementById('error_email');
    if (!emailError.classList.contains('hidden')) {
        emailError.classList.add('hidden');
        emailError.textContent = 'Kötelező mező';
    }

    
});

function clearFormFields() {
    const inputIds = [
        'newstaff_name',
        'newstaff_email',
        'newstaff_password',
        'newstaff_access_level',
        'newstaff_phone_number',
        'newstaff_address_zipcode',
        'newstaff_address_city',
        'newstaff_address_street',
        'newstaff_address_housenumber',
        'newstaff_superbrutto',
        'newstaff_birthdate'
    ];

    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });

    // Esetleges hibaszövegek elrejtése
    const errorIds = [
        'error_name',
        'error_email',
        'error_password',
        'error_position',
        'error_phonenumber',
        'error_zipcode',
        'error_city',
        'error_street',
        'error_housenumber',
        'error_superbrutto',
        'error_birthdate'
    ];

    errorIds.forEach(id => {
        const error = document.getElementById(id);
        if (error) {
            error.classList.add('hidden');
            error.textContent = "Kötelező mező!"; // vagy amit alapból írsz ki
        }
    });
}



function addUser(userData) {
    fetch(`${API_URL}employee`, {
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





document.addEventListener("DOMContentLoaded", function () {
    const editModal = document.getElementById("editModal");
    const saveChanges = document.getElementById("saveChanges");
    const closeUserSettingsMenuModal = document.getElementById("closeUserSettingsMenuModal");

    const tableBody = document.getElementById("employeesTable").querySelector("tbody");
    const mobileView = document.getElementById("mobileView"); // ID, amit használsz a mobilos listához

    // Űrlap mezők
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPosition = document.getElementById("editPosition");
    const editPhone = document.getElementById("editPhone");
    const editZip = document.getElementById("editZip");
    const editCity = document.getElementById("editCity");
    const editStreet = document.getElementById("editStreet");
    const editHouse = document.getElementById("editHouse");

    let editingRow = null;

    // ASZTALI nézethez
    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest(".edit-btn");

        if (button) {
            const id = button.dataset.id;
const partner = employeesData.find(emp => emp.staff_ID == id);
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
            const partner = employeesData.find(emp => emp.staff_ID == id);
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
    editPosition.value = partner.status?.toString() || "1";
    editPhone.value = partner.phone_number || "";
    editZip.value = partner.zipcode || "";
    editCity.value = partner.address_city || "";
    editStreet.value = partner.address_street || "";
    editHouse.value = partner.address_number || "";

    saveChanges.dataset.id = partner.staff_ID;

    // 💡 Itt frissítjük az eredeti e-mailt
    originalEmail = partner.email || "";

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

    const accessLevelMap = {
        "Adminisztrátor": 4,
        "Vezető": 3,
        "Vezető Eladó": 2,
        "Eladó": 1
    };

    const selectedPositionText = editPosition.options[editPosition.selectedIndex];
    const accessLevel = parseInt(editPosition.value);

    const updatedData = {
        last_name: lastName,
        first_name: firstName,
        position: selectedPositionText,
        phone_number: editPhone.value,
        access_level: accessLevel,
        zipcode: editZip.value,
        address_city: editCity.value,
        address_street: editStreet.value,
        address_number: editHouse.value
    };

    // Csak akkor add hozzá az emailt, ha változott
    if (editEmail.value !== originalEmail) {
        updatedData.email = editEmail.value;
    }

    const response = await fetch(`${API_URL}employee/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        const index = employeesData.findIndex(emp => emp.staff_ID == id);

        if (index !== -1) {
            employeesData[index] = { ...employeesData[index], ...updatedData };
            renderTable();
        }
        editModal.classList.add("hidden");
    } else {
        alert("Hiba a frissítés során!");
        console.error(await response.text());
    }
});
});