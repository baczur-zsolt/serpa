import { API_URL } from './config.js';
//Pagination

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let productsData = [];

const EXCLUDED_BILLS_KEY = 'excludedBillNumbers'; // localStorage kulcs

// Kizárt számlaszámok betöltése localStorage-ból
function loadExcludedBillNumbers() {
    try {
        const storedData = localStorage.getItem(EXCLUDED_BILLS_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (err) {
        console.error("Hiba a kizárt számlaszámok betöltésekor:", err);
        return [];
    }
}

// Kizárt számlaszámok mentése localStorage-ba
function saveExcludedBillNumbers(billNumbers) {
    try {
        localStorage.setItem(EXCLUDED_BILLS_KEY, JSON.stringify(Array.from(billNumbers)));
    } catch (err) {
        console.error("Hiba a kizárt számlaszámok mentésekor:", err);
    }
}





Promise.all([
  fetch(`${API_URL}sale`, { cache: "no-store" }),
  fetch(`${API_URL}buy`, { cache: "no-store" }),
  fetch(`${API_URL}partner`, { cache: "no-store" }),
  fetch(`${API_URL}sale`, { cache: "no-store" })
])
  .then(([saleRes, buyRes, partnerRes, saleDetailsRes]) => {
    return Promise.all([
      saleRes.json(),
      buyRes.json(),
      partnerRes.json(),
      saleDetailsRes.json()
    ]);
  })
  .then(([saleData, buyData, partnerData, saleDetails]) => {
    // Kombinált adat létrehozása
    const combinedData = [
      ...saleData.map(item => ({
        ...item,
        type: "Eladás",
        id: item.sale_ID,
        date: item.sale_date,
        comment: item.comment?.startsWith("A(z) ") ? item.comment.slice(5) : item.comment
      })),
      ...buyData.map(item => ({
        ...item,
        type: "Bevételezés",
        id: item.buy_ID,
        date: item.buy_date
      }))
    ];

    // Csak azok a tételek, amelyeknél a quantity_sale nem negatív
    const filteredData = combinedData.filter(item => {
      if (item.type === "Eladás") {
        return item.quantity_sale > 0;
      }
      return true; // A bevételezések átmennek
    });

    // Adatok rendezése dátum alapján (legújabb elöl)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Globális adattárolók frissítése
    employeesData = filteredData;
    productsData = partnerData;

    // Sztornó kapcsolatok felépítése és frissítése
    updateStornoRelationships();

    // Táblázat renderelése
    renderTable();
  })
  .catch(error => {
    console.error("Hiba az adatok betöltése közben:", error);
  });

// Sztornó kapcsolatok felépítése és localStorage frissítése
function updateStornoRelationships() {
    // Gyűjtsük össze a sztornózott és eredeti számlákat
    const excludedBillNumbers = new Set(loadExcludedBillNumbers());
    
    // Először megtaláljuk az összes sztornózott számlát és annak eredeti számláját
    employeesData.forEach(item => {
        // Ellenőrizzük, hogy sztornózott számláról van-e szó
        const isStorno = item.comment && 
                        (item.comment.includes("jóváírása") || 
                         item.comment.includes("jóváírás")) &&
                        (item.quantity_sale < 0 || item.total_price < 0);
        
        if (isStorno) {
            // A sztornó számláját hozzáadjuk a kizárandókhoz
            if (item.bill_number) {
                excludedBillNumbers.add(item.bill_number);
            }
            
            // Az eredeti számla azonosítójának kinyerése a kommentből
            const originalBillNumberMatch = item.comment?.match(/A\(z\) ([^\s]+) számú/);
            if (originalBillNumberMatch && originalBillNumberMatch[1]) {
                const originalBillNumber = originalBillNumberMatch[1];
                // Az eredeti számlát is kizárjuk
                excludedBillNumbers.add(originalBillNumber);
                console.log(`Kizárva: Sztornó számla: ${item.bill_number}, Eredeti számla: ${originalBillNumber}`);
            }
        }
    });
    
    console.log("Kizárt számlaszámok:", Array.from(excludedBillNumbers));
    
    // Mentsük el a localStorage-ba
    saveExcludedBillNumbers(excludedBillNumbers);
}

// 🔹 Táblázat frissítése az aktuális oldallal
function renderTable() {
    tableBody.innerHTML = "";  // Clear table
    mobileView.innerHTML = ""; // Clear mobile view

    // Kizárt számlaszámok betöltése localStorage-ból
    const excludedBillNumbers = new Set(loadExcludedBillNumbers());
    
    console.log("Renderelés során kizárt számlaszámok:", Array.from(excludedBillNumbers));
    
    // Szűrjük az adatokat, hogy kizárjuk mind a sztornó, mind az eredeti számlákat
    const filteredData = employeesData.filter(item => {
        // Ha nincs számlaszám, megtartjuk (bevételezés lehet)
        if (!item.bill_number) {
            return true;
        }
        
        // Ha a számlaszám szerepel a kizárandók között, akkor kiszűrjük
        if (excludedBillNumbers.has(item.bill_number)) {
            console.log(`Kiszűrt számla: ${item.bill_number}`);
            return false;
        }
        
        return true;
    });

    console.log(`Eredeti adatok száma: ${employeesData.length}, Szűrt adatok száma: ${filteredData.length}`);

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = filteredData.slice(start, end);

    // Táblázat renderelése
    paginatedItems.forEach(user => {
        const customer = productsData.find(p => p.customer_ID === user.customer_ID);
        const customerName = customer ? `${customer.last_name} ${customer.first_name}` : "N/A";
        const transactionType = user.type || "Eladás";
        const customerStatus = customer ? (customer.status === 0 ? "Vásárló" : "Beszállító") : "N/A";

        // Table row
        let row = document.createElement("tr");
        row.classList.add("hover:bg-gray-100");
        row.id = user.id;
        row.innerHTML = `
            <td class="hidden">${user.id || user.buy_ID || user.sale_ID}</td>
            <td class="px-6 py-4">${user.bill_number}</td>
            <td class="px-6 py-4 font-semibold ${transactionType === "Eladás" ? 'text-green-500' : 'text-red-500'}">
                ${transactionType}
            </td>
            <td class="px-6 py-4">
                ${user.sale_date ? `${user.sale_date}<br>` : ""}
                ${user.buy_date ? `${user.buy_date}` : ""}
            </td>
            <td class="px-6 py-4">${customerName}</td>
            <td class="px-6 py-4">${user.total_price + " Ft"}</td>
            <td class="px-6 py-4">
                <div class="flex justify-center gap-4">
                    ${transactionType === "Eladás" ? `
                        <button class="view-btn desktop-view-btn" view-bill="${user.bill_number}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
                                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                            </svg>
                        </button>
                        <button class="download-btn desktop-download-btn" data-bill="${user.bill_number}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
                                <path d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z"/>
                            </svg>
                        </button>
                    ` : ""}

                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.bill_number || user.bill_number}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // Create mobile card view
        const mobileCard = document.createElement("div");
        mobileCard.className = "bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200";
        mobileCard.setAttribute("data-id", user.customer_ID);
        mobileCard.innerHTML = `
            <div class="flex justify-between">
                <h3 class="text-lg font-semibold text-gray-900">${customerName}</h3>
                <div class="flex gap-2">
                    ${transactionType === "Eladás" ? `
                        <button class="view-btn desktop-view-btn" view-bill="${user.bill_number}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
                                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                            </svg>
                        </button>
                        <button class="download-btn desktop-download-btn" data-bill="${user.bill_number}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#009df7">
                                <path d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z"/>
                            </svg>
                        </button>
                    ` : ""}
                    
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.bill_number}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500">Adószám: ${customer ? customer.tax_number : "N/A"}</p>
            <p class="text-sm">${customerStatus}</p>
            <p class="text-sm text-gray-500">Irányítószám: ${customer ? customer.zipcode : "N/A"}</p>
            <p class="text-sm text-gray-500">Város: ${customer ? customer.address_city : "N/A"}</p>
            <p class="text-sm text-gray-500">Utca: ${customer ? customer.address_street : "N/A"}</p>
            <p class="text-sm text-gray-500">Házszám: ${customer ? customer.address_number : "N/A"}</p>
        `;
        mobileView.appendChild(mobileCard);
    });

    generatePageNumbers();
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

/*
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
*/
// ablak átméretezés figyelő
window.addEventListener('resize', () => {
  renderTable();
});

// Segédfüggvény a sztornózott számlák szűréséhez
function filterOutStornoInvoices(invoices) {
    const stornoOriginalNumbers = new Set();
    
    // 1. Gyűjtsük össze az eredeti számlaszámokat a sztornók commentjeiből
    invoices.forEach(invoice => {
        if (invoice.comment && invoice.comment.includes("jóváírása")) {
            const match = invoice.comment.match(/A\(z\) (.*?) számú számla jóváírása/);
            if (match && match[1]) {
                stornoOriginalNumbers.add(match[1]);
            }
        }
    });
    
    // 2. Szűrjük ki a sztornókat és az eredeti számlákat is
    return invoices.filter(invoice => {
        // Ha ez egy sztornó számla
        if (invoice.comment && invoice.comment.includes("jóváírása")) {
            return false;
        }
        
        // Ha ehhez a számlához van sztornó
        if (stornoOriginalNumbers.has(invoice.bill_number)) {
            return false;
        }
        
        return true;
    });
}




// Törlés
async function deleteSale(billNumber) {
    console.log("Törléshez használt billNumber:", billNumber);
    
    if (!billNumber) {
        alert("Érvénytelen számlaszám!");
        return;
    }

    // Számlaszám feldolgozása
    const billNumberParts = billNumber.split('-');
    const billNumberSuffix = billNumberParts[billNumberParts.length - 1].padStart(6, '0');

    // Elem keresése - figyelünk a nullish értékekre is
    const item = employeesData.find(emp => {
        if (!emp.bill_number) return false;
        const empParts = emp.bill_number.split('-');
        return empParts[empParts.length - 1] === billNumberSuffix;
    });

    if (!item) {
        alert(`Nem található az elem a megadott számlaszámmal: ${billNumber}`);
        return;
    }

    // Már létező sztornó ellenőrzése
    const existingStorno = employeesData.find(emp => 
        emp.comment?.includes(`A(z) ${item.bill_number} számú számla jóváírása.`));

    if (existingStorno) {
        alert("Ehhez a számlához már készült jóváíró számla!");
        return;
    }

    // Ellenőrizzük, hogy ez a számla nem maga is egy sztornó-e
    if (item.quantity_sale < 0 || item.total_price < 0 || 
        (item.comment && item.comment.includes("jóváírása"))) {
        alert("Ez a számla már maga is egy sztornó számla, ezt nem lehet sztornózni!");
        return;
    }

    if (!confirm(`Biztosan sztornóznád a(z) ${item.bill_number} számú számlát?`)) return;

    try {
        // Sztornó adatok előkészítése
        const itemsToReverse = employeesData.filter(emp => emp.bill_number === item.bill_number);
        
        if (itemsToReverse.length === 0) {
            alert("Nem találhatók a sztornózandó számla tételei!");
            return;
        }

        const reversalData = itemsToReverse.map(emp => ({
            staff_ID: emp.staff_ID,
            customer_ID: emp.customer_ID,
            product_ID: emp.product_ID,
            quantity_sale: emp.quantity_sale * -1, // Negatív értékkel állítjuk be
            comment: `A(z) ${emp.bill_number} számú számla jóváírása.`
        }));

        // API hívás
        const response = await fetch(`${API_URL}sale/delete/${billNumberSuffix}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reversalData)
        });

        let responseText = '';
        try {
            responseText = await response.text();
        } catch (err) {
            console.error("Válasz szöveg olvasási hiba:", err);
        }

        if (!response.ok) {
            throw new Error(responseText || `HTTP hiba! Státusz: ${response.status}`);
        }

        // A szerver válaszának feldolgozása
        let result;
        try {
            // Csak akkor próbáljuk JSON-ként értelmezni, ha tényleg van tartalom
            if (responseText && responseText.trim()) {
                result = JSON.parse(responseText);
            }
        } catch (err) {
            console.error("Válasz JSON feldolgozási hiba:", err);
            // Nem állítjuk le a folyamatot, lehet, hogy nem JSON választ kaptunk
        }

        // Sikeres sztornózás feldolgozása - akár kaptunk JSON választ, akár nem
        if (result && Array.isArray(result) && result.length > 0) {
            // Szerver által visszaadott sztornó számlák hozzáadása
            employeesData.push(...result);
            console.log("Sztornó sikeres, szerver által visszaadott adatok hozzáadva:", result);
        } else {
            console.warn("A szerver nem adott vissza elemeket, manuálisan adjuk hozzá a sztornó tételt");
            
            // Segédfüggvény az új számlaszám generálásához, ha nincs definiálva
            const generateNewBillNumber = () => {
                // Ha van ilyen függvény, használd azt
                if (typeof window.generateNewBillNumber === 'function') {
                    return window.generateNewBillNumber();
                }
                
                // Ha nincs, generálunk egy ideiglenes számlaszámot
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                
                return `STORNO-${year}${month}${day}-${random}`;
            };
            
            // Sztornó tételek létrehozása
            const newItems = reversalData.map(item => {
                // A megfelelő termék nevének megtalálása
                const originalItem = employeesData.find(e => e.product_ID === item.product_ID);
                
                return {
                    ...item,
                    type: "Eladás",
                    bill_number: generateNewBillNumber(),
                    product_name: originalItem?.product_name || "Ismeretlen termék",
                    date: new Date().toISOString().split('T')[0], // Mai dátum
                    total_price: -(originalItem?.total_price || 0), // Negatív érték
                    id: `storno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Egyedi azonosító
                };
            });
            
            employeesData.push(...newItems);
        }

        // Mentsük el a sztornózott és az eredeti számlát a kizártakhoz
        const excludedBillNumbers = new Set(loadExcludedBillNumbers());
        
        // Az eredeti számla kizárása
        excludedBillNumbers.add(item.bill_number);
        
        // Az új sztornó számla kizárása (ha van)
        if (result && Array.isArray(result) && result.length > 0) {
            result.forEach(storno => {
                if (storno.bill_number) excludedBillNumbers.add(storno.bill_number);
            });
        }
        
        // Mentsük el a frissített kizárt számlákat
        saveExcludedBillNumbers(excludedBillNumbers);
        
        alert("Sikeres sztornózás! Jóváíró számla létrehozva.");
        
        // Frissítsük a sztornó kapcsolatokat és rendereljük újra a táblázatot
        updateStornoRelationships();
        renderTable();

    } catch (err) {
        console.error("Sztornó hiba:", err);
        alert(`Hiba történt a sztornózás során: ${err.message}`);
    }
}


// Segédfüggvény az új számlaszám generálásához
function generateNewBillNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `ST-${year}-`;
    
    const lastStorno = employeesData
        .filter(e => e.bill_number.startsWith(prefix))
        .sort()
        .pop();
    
    const lastNumber = lastStorno 
        ? parseInt(lastStorno.bill_number.split('-')[2]) 
        : 0;
    
    return `${prefix}${String(lastNumber + 1).padStart(6, '0')}`;
}


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


function editSale(id) {
  const item = employeesData.find(emp => emp.id == id);

  if (!item) return alert("Nem található az elem.");

  if (item.type !== "Eladás") {
    alert("Csak eladást lehet szerkeszteni.");
    return;
  }

  openEditModal(item); // meglévő modal nyitó logika
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

document.getElementById('applyNewStaff').addEventListener('click', async function(event) {
  event.preventDefault();

  // Összes hibaüzenet törlése
  clearErrors(document.getElementById('applyNewStaffForm'));
  
  let isValid = true;

  // 1. VEVŐ VALIDÁLÁSA
  const selectedCustomer = document.getElementById('selectedCustomer');
  const customerHiddenInput = document.getElementById('customer_ID');

  if (selectedCustomer.textContent === 'Válassz ügyfelet' || !customerHiddenInput.value) {
    showError(customerHiddenInput, 'Kötelező kiválasztani egy ügyfelet!');
    isValid = false;
  } else {
    clearError(customerHiddenInput);
  }

  // 2. TERMÉK VALIDÁLÁSA
  const selectedProduct = document.querySelector('.selectedProduct');
  const productHiddenInput = document.querySelector('.product_ID');

  if (selectedProduct.textContent === 'Válassz terméket' || !productHiddenInput.value) {
    showError(productHiddenInput, 'Kötelező kiválasztani egy terméket!');
    isValid = false;
  } else {
    clearError(productHiddenInput);
  }

  // 3. MENNYISÉG VALIDÁLÁSA
  const quantityInput = document.getElementById('quantity');
  if (!quantityInput.value || isNaN(quantityInput.value)) {
    showError(quantityInput, 'Kötelező megadni érvényes mennyiséget!');
    isValid = false;
  } else {
    clearError(quantityInput);
  }

  // HA MINDEN RENDBEN, KÜLDJÜK EL AZ ŰRLAPOT
  if (isValid) {
    const form = document.getElementById('applyNewStaffForm');
    const formData = new FormData(form);
    
    const sellerID = await getLoggedInStaffID();
    const customerID = parseInt(formData.get('customer_ID'));
    const productID = parseInt(formData.get('product_ID[]'));
    const quantity = parseInt(formData.get('quantity[]'));
    const unitPrice = parseFloat(document.querySelector('input[name="price[]"]').value);

    console.log('Elküldött adatok:', {
      eladó: sellerID,
      vevő: customerID,
      termék: productID,
      mennyiség: quantity,
      egységár: unitPrice
    });

    // EXTRA ELLENŐRZÉSEK
    if (isNaN(sellerID)) {
      alert('Hiba történt az eladó azonosításakor!');
      return;
    }

    if (isNaN(customerID)) {
      alert('Érvénytelen vevő azonosító!');
      return;
    }

    if (isNaN(productID)) {
      alert('Érvénytelen termék azonosító!');
      return;
    }

    if (isNaN(quantity)) {
      alert('Érvénytelen mennyiség!');
      return;
    }

    if (isNaN(unitPrice)) {
      alert('Érvénytelen egységár!');
      return;
    }

    const saleData = [{
      staff_ID: sellerID,
      customer_ID: customerID,
      product_ID: productID,
      quantity_sale: quantity,
      unit_price: unitPrice
    }];

    try {
      
      const response = await submitSaleData(saleData);
      console.log("Kapott válasz a submitSaleData-tól:", response);
      // Sikeres válasz kezelése
      if (response && response.staff_ID && response.customer_ID) {
        // Űrlap alaphelyzetbe állítása
        form.reset();
        
        // Dropdownok alaphelyzetbe
        selectedCustomer.textContent = "Válassz ügyfelet";
        customerHiddenInput.value = "";
        selectedProduct.textContent = "Válassz terméket";
        productHiddenInput.value = "";
        
        // Modal bezárása
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        
        // Sikeres üzenet
        alert('Sikeres eladás!');
        location.reload()
      } else {
        throw new Error("Hibás válasz a szervertől");
      }
    } catch (error) {
      console.error('Hiba történt:', error);
      alert(`Hiba történt: ${error.message}`);
    }
  }
});

// A MEGADOTT SUBMIT FUNKCIÓ
async function submitSaleData(userData) {
  try {
    const response = await fetch(`${API_URL}sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    console.log("Backend válasz teljesen:", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Hiba a szerveren: ${errorData.message || response.status}`);
    }

    const data = await response.json();
    console.log("Backend válasz:", data);
    return data;

  } catch (error) {
    console.error('Hiba történt az eladás rögzítésekor:', error);
    throw error;
  }
}

// SEGÉDFÜGGVÉNYEK
function showError(inputElement, message) {
  clearError(inputElement);

  const errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message', 'text-red-500', 'text-sm', 'mt-1');
  errorMessage.textContent = message;

  inputElement.insertAdjacentElement('afterend', errorMessage);
}

function clearError(inputElement) {
  const next = inputElement.nextElementSibling;
  if (next && next.classList.contains('error-message')) {
    next.remove();
  }
}

function clearErrors(form) {
  form.querySelectorAll('.error-message').forEach(el => el.remove());
}

async function getLoggedInStaffID() {
  try {
    const response = await fetch(`${API_URL}username`);
    if (!response.ok) throw new Error('Nem sikerült lekérni a bejelentkezett felhasználót.');
    const data = await response.json();
    console.log("Bejelentkezett user adatai:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data[0].staff_ID;
    } else {
      throw new Error('Nem találtam staff_ID-t a válaszban.');
    }
  } catch (err) {
    console.error(err);
    alert('Hiba történt a bejelentkezett eladó lekérdezésekor.');
    return null;
  }
}


// ========BEVÉTELEZÉS=========









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
// Form submit kezelés
/*
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
    formIsValid = false;
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
      formIsValid = false;
    }
  });

  if (!formIsValid) {
    return; // Nem megy tovább, ha hiba van
  }

  // Ha minden jó, bezárjuk a modalt és elküldjük az adatokat
  const userData = {
    sellerID: parseInt(sellerID), // Számra konvertálás
    customerID: parseInt(customerID), // Számra konvertálás
    products: productIDs.map(id => parseInt(id)), // Termék ID-k számra konvertálása
    quantities: quantities.map(qty => parseInt(qty)), // Mennyiségek számra konvertálása
    prices: prices.map(price => parseFloat(price)) // Ár számra konvertálása
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

// Hibakezelés segédfüggvénye
function showError(input, message) {
  const errorMessage = document.createElement('span');
  errorMessage.classList.add('error-message', 'text-red-500');
  errorMessage.textContent = message;
  input.classList.add('border-red-500');
  input.insertAdjacentElement('afterend', errorMessage);
}


*/

// Az addUser függvény, amely elküldi a POST kérést




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
        .filter(partner => partner.status === 0) // csak a státusz 0-ásokat engedi át
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
    li.setAttribute("data-value", partner.customer_ID);
    li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
    li.addEventListener("click", function () {
      selectedCustomer.textContent = displayName;
      customerInput.value = partner.customer_ID;
      dropdownOptions.classList.add("hidden");
    });
    dropdownOptions.appendChild(li);
    console.log(partner)
  });
      })
      .catch((error) => {
        console.error("Hiba az adatok betöltésekor:", error);
      });
  
      // === BESZÁLLÍTÓK legördülő betöltése ===
const supplierButton = document.getElementById("selectedSupplier");
const supplierOptions = document.getElementById("supplierOptions");
const supplierInput = document.getElementById("supplier_ID");

// Hely, ahová a beszállító nevét kiírjuk:
const supplierTextSpan = supplierButton.querySelector("span");

// Toggle legördülő
supplierButton.addEventListener("click", (e) => {
  e.preventDefault();
  supplierOptions.classList.toggle("hidden");
});

// Bezárás máshova kattintás esetén
document.addEventListener("click", function (e) {
  if (!supplierButton.contains(e.target) && !supplierOptions.contains(e.target)) {
    supplierOptions.classList.add("hidden");
  }
});

// Partner lista betöltése beszállítókhoz (status == 1 pl.)
fetch(`${API_URL}partner`)
  .then((res) => res.json())
  .then((partnerData) => {
    supplierOptions.innerHTML = "";

    partnerData
      .filter(p => p.status === 1) // itt beszállítói státuszt feltételezünk
      .sort((a, b) => {
        const nameA = (a.name || `${a.last_name} ${a.first_name}`).toLowerCase();
        const nameB = (b.name || `${b.last_name} ${b.first_name}`).toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .forEach((partner) => {
        const displayName = partner.name || `${partner.last_name} ${partner.first_name}`;
        const li = document.createElement("li");
        li.textContent = displayName;
        li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
        li.addEventListener("click", function () {
          supplierTextSpan.textContent = displayName;
          supplierInput.value = partner.customer_ID;
          supplierOptions.classList.add("hidden");
        });
        supplierOptions.appendChild(li);
      });
  })
  .catch((error) => {
    console.error("Hiba a beszállítók betöltésekor:", error);
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
  
    // A fillDropdown függvényt módosítom a bevételzési formhoz
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
        const priceInput = fullRow ? fullRow.querySelector('.productUnitPrice') : null;
        
        // Itt a beszerzési árat (product_price) használjuk bevételzésnél
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
          <input type="hidden" name="product_ID" class="product_ID" required>
          <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
          <button type="button"  class="removeProductRow text-sm text-red-500 hover:underline mt-2">
                  - Termék eltávolítása
                </button>
        </div>
  
        <div class="flex-1">
          <label class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Mennyiség</label>
          <input type="number" name="quantity" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Mennyiség" required>
          <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
        </div>
  
        <div class="flex-1">
          <label class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Egységár</label>
          <input type="number" name="price" class="productUnitPrice  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Egységár" disabled>
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



  const buyingForm = document.getElementById("buyingForm");
  const buyingSubmitBtn = document.getElementById("submitBuyingForm");
  
  if (buyingForm && buyingSubmitBtn) {
    buyingSubmitBtn.addEventListener("click", async function (event) {
      event.preventDefault();
  
      clearErrors(buyingForm);
      let isValid = true;
  
      // 1. Beszállító validálás
      const selectedSupplier = document.getElementById("selectedSupplier");
      const supplierHiddenInput = document.getElementById("supplier_ID");
  
      if (!supplierHiddenInput?.value || selectedSupplier?.textContent === "Válassz beszállítót") {
        showError(supplierHiddenInput, "Kötelező kiválasztani egy beszállítót!");
        isValid = false;
      }
  
      // 2. Termék validálás
      const productInputs = buyingForm.querySelectorAll(".product_ID");
      const productTexts = buyingForm.querySelectorAll(".selectedProduct");
  
      productInputs.forEach((input, index) => {
        if (!input.value || productTexts[index]?.textContent === "Válassz terméket") {
          showError(input, "Kötelező kiválasztani egy terméket!");
          isValid = false;
        }
      });
  
      // 3. Mennyiség validálás
      const quantityInputs = buyingForm.querySelectorAll("input[name='quantity']");
      quantityInputs.forEach(input => {
        if (!input.value || isNaN(input.value) || parseInt(input.value) <= 0) {
          showError(input, "Kötelező megadni érvényes mennyiséget!");
          isValid = false;
        }
      });
  
      // 4. Egységár validálás
      const priceInputs = buyingForm.querySelectorAll("input[name='price']");
      priceInputs.forEach(input => {
        if (!input.value || isNaN(input.value) || parseFloat(input.value) <= 0) {
          showError(input, "Érvénytelen egységár!");
          isValid = false;
        }
      });

      function validateCustomDropdowns() {
        let isValid = true;
    
        // Beszállító validálás
        const supplierInput = document.querySelector('#supplier_ID');
        const supplierError = supplierInput.closest('.relative').querySelector('.error-message');
    
        if (!supplierInput.value) {
            supplierError.classList.remove('hidden');
            isValid = false;
        } else {
            supplierError.classList.add('hidden');
        }
    
        // Termék validálás (minden sorban)
        const productInputs = document.querySelectorAll('input[name="product_ID"]');
        productInputs.forEach(input => {
            const errorSpan = input.closest('.relative').querySelector('span.text-red-500');
            if (!input.value) {
                errorSpan.classList.remove('hidden');
                isValid = false;
            } else {
                errorSpan.classList.add('hidden');
            }
        });
    
        return isValid;
    }
  
      if (!isValid) return;
  
      const formData = new FormData(buyingForm);
      const staffID = await getLoggedInStaffID();
      const supplierID = parseInt(formData.get("supplier_ID"));
      const productIDs = formData.getAll("product_ID").map(id => parseInt(id));
      const quantities = formData.getAll("quantity").map(q => parseInt(q));
      const billNumber = formData.get("bill_number");
  
      console.log('sellerID:', staffID);
      console.log('supplierID:', supplierID);
      console.log('productIDs:', productIDs);
      console.log('quantities:', quantities);
  
      if (
        isNaN(staffID) ||
        isNaN(supplierID) ||
        productIDs.length === 0 ||
        quantities.length === 0 ||
        productIDs.some(id => isNaN(id)) ||
        quantities.some(q => isNaN(q))
      ) {
        alert("Hibás vagy hiányos adatok!");
        return;
      }
  
      // Adatok struktúrázása a backend által várt formátumban
      const buyingData = productIDs.map((productID, index) => ({
        staff_ID: staffID,
        customer_ID: supplierID, // Az ügyfél ID-ja (beszállító)
        product_ID: productID,
        quantity_buy: quantities[index],
        bill_number: billNumber // Tetszőleges számlaszám, ha szükséges
      }));
  
      // Az adatok elküldése a backendnek
      const result = await submitBuyingData(buyingData);
      console.log("Visszakapott adat:", result);
  
      // Ha sikeres a válasz, akkor frissítjük a táblázatot
      if (result && result.length > 0) {
        // Új rekordok hozzáadása a táblázathoz
        result.forEach(entry => {
          employeesData.unshift({
            ...entry,
            type: "Bevételezés",
            id: entry.buy_ID,
            bill_number: entry.bill_number || billNumber,
            date: entry.buy_date,
            total_price: entry.total_price,
            customer_ID: entry.customer_ID
          });
        });
  
        // Időrend szerinti újrarendezés (ha kell)
        employeesData.sort((a, b) => new Date(b.buy_date || b.sale_date) - new Date(a.buy_date || a.sale_date));
  
        // A táblázat újrarenderelése
        renderTable(); 
      }
  
      // Form ürítése
      buyingForm.reset();
      document.getElementById("selectedSupplier").textContent = "Válassz beszállítót";
      document.getElementById("supplier_ID").value = "";
  
      document.querySelectorAll(".productRow").forEach(row => {
        row.querySelector(".selectedProduct").textContent = "Válassz terméket";
        row.querySelector(".product_ID").value = "";
        row.querySelector(".productUnitPrice").value = "";
      });
  
      // Modal bezárása
      buyingModal.classList.add("hidden");
      BuyingOverlay.classList.add("hidden");
    });
  }


  
  
  async function submitBuyingData(data) {
    try {
      const response = await fetch(`${API_URL}buy`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba a bevételzés során");
      }
  
      const result = await response.json();
      
      // Frissítjük a táblázatot az új adatokkal
      result.forEach(item => {
        employeesData.unshift({
          ...item,
          type: "Bevételezés",
          id: item.buy_ID,
          date: item.buy_date
        });
      });
  
      renderTable();
      return result;
      
    } catch (error) {
      console.error("Bevételzési hiba:", error);
      alert(`Hiba történt: ${error.message}`);
      return null;
    }
  }

// Törlés 
async function deleteSaleByBillNumber(billNumber) {
  const item = employeesData.find(emp => emp.bill_number.endsWith(`-${billNumber}`));
  if (!item) return alert("Nem található az elem a megadott számlaszámmal.");

  if (!confirm(`Biztosan sztornóznád a(z) ${item.bill_number} számú számlát?`)) return;

  try {
    const response = await fetch(`${API_URL}sale/delete/${billNumber}`, {
      method: "POST"
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Hiba történt a sztornózás során.");
    }

    const newItems = await response.json();

    if (!Array.isArray(newItems)) {
      throw new Error("Hibás válaszformátum a szervertől.");
    }

    alert("Sikeres sztornózás! Mínuszos számla létrehozva.");

    // Hozzáadjuk a mínuszos számlasorokat
    employeesData.push(...newItems);

    renderTable();
  } catch (err) {
    console.error("Sztornó hiba:", err);
    alert(`Hiba: ${err.message}`);
  }
}




// Szerkesztés 
function editSale(id) {
  const item = employeesData.find(emp => emp.id == id);

  if (!item) return alert("Nem található az elem.");

  if (item.type !== "Eladás") {
    alert("Csak eladást lehet szerkeszteni.");
    return;
  }

  openEditModal(item); // meglévő modal nyitó logika
}










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



