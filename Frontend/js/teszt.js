const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 9;
let currentPage = 1;
let employeesData = [];

// Felhasználók adatainak lekérése
fetch('http://localhost:5000/tbl_staff')
    .then(res => res.json())
    .then(data => {
        employeesData = data;
        renderTable();
    })
    .catch(error => console.error("Hiba a letöltésnél:", error));

// Táblázat frissítése
function renderTable() {
    tableBody.innerHTML = "";

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = employeesData.slice(start, end);

    paginatedItems.forEach(user => {
        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.dataset.id = user.staff_id;

        row.innerHTML = `
            <td class="hidden">${user.staff_id}</td>
            <th class="flex gap-3 px-6 py-4 font-normal text-gray-900">
                <div class="text-sm">
                    <div class="font-medium text-gray-700">${user.name}</div>
                    <div class="text-gray-400">${user.email}</div>
                </div>
            </th>
            <td class="px-6 py-4">${user.last_name + ' ' + user.first_name}</td>
            <td class="px-6 py-4">
                ${user.status === 'A' ? 
                    '<span class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600"><span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>Aktív</span>' :
                    user.status === 'I' ?
                    '<span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"><span class="h-1.5 w-1.5 rounded-full bg-red-600"></span>Inaktív</span>' :
                    '<span class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600"><span class="h-1.5 w-1.5 rounded-full bg-gray-600"></span>Ismeretlen</span>'
                }
            </td>
            <td class="px-6 py-4">${user.access_level}</td>
            <td class="px-6 py-4">${user.phone_number}</td>
            <td class="px-6 py-4">${user.address_zipcode}</td>
            <td class="px-6 py-4">${user.address_city}</td>
            <td class="px-6 py-4">${user.address_street}</td>
            <td class="px-6 py-4">${user.address_housenumber}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${user.staff_id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                        </svg>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.staff_id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    generatePageNumbers();
}

// Oldalszámok generálása
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

// Következő oldal
function nextPage() {
    if (currentPage < Math.ceil(employeesData.length / rowsPerPage)) {
        currentPage++;
        renderTable();
    }
}

// Előző oldal
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// Első megjelenítés
renderTable();

document.getElementById("prevBtn").addEventListener("click", prevPage);
document.getElementById("nextBtn").addEventListener("click", nextPage);

// Felhasználó törlése
function deleteUser(selectedUserId) {
    fetch(`http://localhost:5000/tbl_staff/${selectedUserId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            employeesData = employeesData.filter(user => user.staff_id !== selectedUserId);
            renderTable();
        } else {
            alert("Sikertelen törlés");
        }
    })
    .catch(error => console.error("Hiba:", error));
}

// Felhasználó törlése a sorból az ikon megnyomásával
document.addEventListener("click", function (event) {
    let trashIcon = event.target.closest(".delete-btn");
    if (trashIcon) {
        let selectedUserId = trashIcon.getAttribute("data-id");
        deleteUser(selectedUserId);
    }
});

// Új alkalmazott hozzáadása
document.getElementById('applyNewStaff').addEventListener('click', function(event) {
    event.preventDefault();

    const fullName = document.getElementById('newstaff_name').value;
    const nameParts = fullName.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts[1] || "";

    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: document.getElementById('newstaff_email').value,
        phone_number: document.getElementById('newstaff_phone_number').value,
        address_zipcode: document.getElementById('newstaff_address_zipcode').value,
        address_city: document.getElementById('newstaff_address_city').value,
        address_street: document.getElementById('newstaff_address_street').value,
        address_housenumber: document.getElementById('newstaff_address_housenumber').value,
        status: document.getElementById('newstaff_status').value,
        access_level: document.getElementById('newstaff_access_level').value
    };

    fetch('http://localhost:5000/tbl_staff', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(newUser => {
        employeesData.push(newUser);
        renderTable();
        alert("Új alkalmazott sikeresen hozzáadva!");
    })
    .catch(error => console.error("Hiba az alkalmazott hozzáadásánál:", error));
});
