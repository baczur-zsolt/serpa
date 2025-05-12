import { API_URL } from './config.js';

const tableBody = document.querySelector("#employeesTable tbody");
const rowsPerPage = 10;
let currentPage = 1;
let employeesData = [];
let productsData = [];

const EXCLUDED_BILLS_KEY = 'excludedBillNumbers'; // localStorage kulcs
const STORNO_BILLS_KEY = 'stornoBillNumbers'; // Új kulcs a sztornó számlákhoz

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

// Sztornó számlaszámok betöltése localStorage-ból
function loadStornoBillNumbers() {
    try {
        const storedData = localStorage.getItem(STORNO_BILLS_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (err) {
        console.error("Hiba a sztornó számlaszámok betöltésekor:", err);
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

// Sztornó számlaszámok mentése localStorage-ba
function saveStornoBillNumbers(billNumbers) {
    try {
        localStorage.setItem(STORNO_BILLS_KEY, JSON.stringify(Array.from(billNumbers)));
    } catch (err) {
        console.error("Hiba a sztornó számlaszámok mentésekor:", err);
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

    const filteredData = combinedData;

    // Adatok rendezése dátum alapján (legújabb elöl)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Globális adattárolók frissítése
    employeesData = filteredData;
    productsData = partnerData;

    // Sztornó kapcsolatok felépítése és frissítése
    updateStornoRelationships();

    renderTable();
  })
  .catch(error => {
    console.error("Hiba az adatok betöltése közben:", error);
  });

// Sztornó kapcsolatok felépítése és localStorage frissítése
function updateStornoRelationships() {
    const excludedBillNumbers = new Set(loadExcludedBillNumbers());
    const stornoBillNumbers = new Set(loadStornoBillNumbers());
    
    employeesData.forEach(item => {
        const isStorno = item.comment && 
                        (item.comment.includes("jóváírása") || 
                         item.comment.includes("jóváírás")) &&
                        (item.quantity_sale < 0 || item.total_price < 0);
        
        if (isStorno) {
            // A sztornó számlát megjelöljük, NEM zárjuk ki
            if (item.bill_number) {
                stornoBillNumbers.add(item.bill_number);
            }
            
            // Az eredeti számla azonosítójának kinyerése a kommentből
            const originalBillNumberMatch = item.comment?.match(/A\(z\) ([^\s]+) számú/);
            if (originalBillNumberMatch && originalBillNumberMatch[1]) {
                const originalBillNumber = originalBillNumberMatch[1];
                // Csak az eredeti számlát zárjuk ki
                excludedBillNumbers.add(originalBillNumber);
                console.log(`Kizárva CSAK az eredeti számla: ${originalBillNumber}`);
            }
        }
    });
    

    
    // Mentsük el a localStorage-ba
    saveExcludedBillNumbers(excludedBillNumbers);
    saveStornoBillNumbers(stornoBillNumbers);
}

// Azonos számlaszámú tételek összevonása
function groupItemsByBillNumber(items) {
    const billGroups = new Map();
    
    items.forEach(item => {
        if (!item.bill_number) {
            const uniqueKey = `no-bill-${item.id}`;
            billGroups.set(uniqueKey, [item]);
            return;
        }
        
        // Ha már létezik ez a számlaszám a Map-ben, akkor hozzáadjuk az új tételt
        if (billGroups.has(item.bill_number)) {
            billGroups.get(item.bill_number).push(item);
        } else {
            // Ha még nem létezik, új tömböt hozunk létre
            billGroups.set(item.bill_number, [item]);
        }
    });
    
    // Összevont tételek létrehozása
    const groupedItems = [];
    
    billGroups.forEach((items, billNumber) => {
        if (items.length === 1) {
            groupedItems.push(items[0]);
        } else {
            const firstItem = items[0];
            
            const groupedItem = {
                ...firstItem,
                // Az összes tétel árának összege
                total_price: items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0),
                // Az összes tétel darabszámának összege
                quantity_sale: items.reduce((sum, item) => sum + (parseFloat(item.quantity_sale) || 0), 0),
                // Az eredeti tételek tárolása egy külön tömbben
                originalItems: items,
                // Ha bármelyik tétel sztornó, az összevont tétel is sztornó lesz
                isGrouped: true,
                // Megjegyzések összefűzése, ha különböznek
                comment: Array.from(new Set(items.map(item => item.comment).filter(Boolean))).join('; ')
            };
            
            groupedItems.push(groupedItem);
        }
    });
    
    return groupedItems;
}

//  Táblázat frissítése az aktuális oldallal
function renderTable() {
    tableBody.innerHTML = "";  // Clear table
    
    // Mobile view clearing
    if (typeof mobileView !== 'undefined' && mobileView) {
        mobileView.innerHTML = "";
    }

    // Kizárt számlaszámok és sztornó számlaszámok betöltése localStorage-ból
    const excludedBillNumbers = new Set(loadExcludedBillNumbers());
    const stornoBillNumbers = new Set(loadStornoBillNumbers());
    
    
    // Szűrjük az adatokat, hogy csak az eredeti számlákat zárjuk ki, a sztornó számlákat megtartjuk
    const filteredData = employeesData.filter(item => {
        // Ha nincs számlaszám, megtartjuk (bevételezés lehet)
        if (!item.bill_number) {
            return true;
        }
        
        // Ha a számlaszám szerepel a kizárandók között (eredeti számlák), akkor kiszűrjük
        if (excludedBillNumbers.has(item.bill_number)) {
            return false;
        }
        
        return true;
    });

    // Azonos számlaszámú tételek összevonása
    const groupedData = groupItemsByBillNumber(filteredData);
    

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = groupedData.slice(start, end);

    // Táblázat renderelése
    paginatedItems.forEach(user => {
        const customer = productsData.find(p => p.customer_ID === user.customer_ID);
        const customerName = customer ? `${customer.last_name} ${customer.first_name}` : "N/A";
        const transactionType = user.type || "Eladás";
        const customerStatus = customer ? (customer.status === 0 ? "Vásárló" : "Beszállító") : "N/A";
        
        // Ellenőrizzük, hogy sztornó számláról van-e szó
        const isStorno = user.bill_number && stornoBillNumbers.has(user.bill_number);
        
        // Csoportosított tételek esetén vizuális jelzés
        const isGrouped = user.isGrouped && user.originalItems && user.originalItems.length > 1;
        const groupedItemsCount = isGrouped ? user.originalItems.length : 1;

        // Table row - sztornó számla esetén piros háttér, csoportosított tételek esetén halványkék háttér
        let row = document.createElement("tr");

// Háttérszín beállítása a tranzakció típusa szerint
if (isStorno) {
    row.classList.add("bg-red-50"); // Piros háttér a sztornó számláknak
} else if (transactionType === "Bevételezés") {
    row.classList.add("bg-blue-50"); // Kék háttér a bevételezéseknek
}
        row.id = user.id;
        row.innerHTML = `
            <td class="hidden">${user.id || user.buy_ID || user.sale_ID}</td>
            <td class="px-6 py-4">
                ${user.bill_number || 'N/A'}
                ${isGrouped ? `<span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">${groupedItemsCount} tétel</span>` : ''}
            </td>
            <td class="px-6 py-4 font-semibold ${transactionType === "Eladás" ? (isStorno ? 'text-red-500' : 'text-green-500') : 'text-blue-500'}">
                ${isStorno ? 'Sztornó ' : ''}${transactionType}
            </td>
            <td class="px-6 py-4">
                ${user.sale_date ? `${user.sale_date}<br>` : ""}
                ${user.buy_date ? `${user.buy_date}` : ""}
            </td>
            <td class="px-6 py-4">${customerName}</td>
            <td class="px-6 py-4">${user.total_price.toLocaleString('hu-HU')} Ft</td>
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

                    ${transactionType !== "Bevételezés" ? `
                <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.bill_number || user.bill_number}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                    ` : ""}
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        if (typeof mobileView !== 'undefined' && mobileView) {
            const mobileCard = document.createElement("div");
            mobileCard.className = `bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200 ${isStorno ? 'bg-red-100' : ''} ${isGrouped ? 'bg-blue-50' : ''}`;
            mobileCard.setAttribute("data-id", user.customer_ID);
            mobileCard.innerHTML = `
                <div class="flex justify-between items-start mb-2">
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
                        ${transactionType === "Eladás" ? `
                        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${user.bill_number || user.bill_number}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff6666">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/>
                            </svg>
                        </button>
                        ` : ""}
                    </div>
                </div>
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Számla:</span> ${user.bill_number || 'N/A'}
                    ${isGrouped ? `<span class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">${groupedItemsCount} tétel</span>` : ''}
                </p>
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Típus:</span> 
                    <span class="${transactionType === "Eladás" ? (isStorno ? 'text-red-500' : 'text-green-500') : 'text-blue-500'}">
                        ${isStorno ? 'Sztornó ' : ''}${transactionType}
                    </span>
                </p>
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Dátum:</span> 
                    ${user.sale_date ? `${user.sale_date}<br>` : ""}${user.buy_date ? `${user.buy_date}` : ""}
                </p>
                <p class="text-sm text-gray-700"><span class="font-medium">Összeg:</span> ${user.total_price.toLocaleString('hu-HU')} Ft</p>
            `;

            mobileView.appendChild(mobileCard);
        }
    });

    // Pagination frissítése, ha létezik a generatePageNumbers függvény
    if (typeof generatePageNumbers === 'function') {
        generatePageNumbers();
    }
    
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('resize', () => {
  renderTable();
});






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

    // Elem keresése
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
      const url = `${API_URL}invoice/${formattedBillNumber}`;
      window.open(url, '_blank');
      return;
  }

  // Szerkesztés gombok
  const editBtn = event.target.closest('.edit-btn');
  if (editBtn) {
      const saleId = editBtn.getAttribute('data-id');
      editSale(saleId);
      return;
  }

  // Törlés gombok
  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
      const saleId = deleteBtn.getAttribute('data-id');
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
          
              const doc = new jsPDF();
          
              // Példa adat
              const productName = "Termék neve";
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




        
        
        
    }

function calculateTotalPages() {
    const excludedBillNumbers = new Set(loadExcludedBillNumbers());
    const filteredData = employeesData.filter(item => {
        if (!item.bill_number) return true;
        if (excludedBillNumbers.has(item.bill_number)) return false;
        return true;
    });
    
    const groupedData = groupItemsByBillNumber(filteredData);
    return Math.ceil(groupedData.length / rowsPerPage);
}

// 🔹 Következő oldal - updated
function nextPage() {
    const totalPages = calculateTotalPages();
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// 🔹 Előző oldal - updated
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

window.addEventListener('resize', () => {
  renderTable();
  generatePageNumbers();
});




function generatePageNumbers() {
    const totalPages = calculateTotalPages();
    
    const pageNumbersDiv = document.getElementById("pageNumbers");
    pageNumbersDiv.innerHTML = "";


    const isMobile = window.innerWidth < 768; 
    

    const maxVisiblePages = isMobile ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (totalPages <= 1) {
        return;
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add(
            "page-button", "rounded-md", "border", "border-slate-300",
            "py-2", "px-3", "text-center", "text-sm", "transition-all",
            "shadow-sm", "hover:shadow-lg", "text-slate-600",
            "hover:text-white", "hover:bg-blue-600", "hover:border-blue-600",
            "focus:text-white", "focus:bg-blue-600", "focus:border-blue-600",
            "active:border-blue-600", "active:text-white", "active:bg-blue-800",
            "disabled:pointer-events-none", "disabled:opacity-50", "disabled:shadow-none",
            "ml-2"
        );

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


document.getElementById("firstBtn").addEventListener("click", () => {
    if (currentPage !== 1) {
        currentPage = 1;
        renderTable();
    }
});


document.getElementById("lastBtn").addEventListener("click", () => {
    const totalPages = calculateTotalPages();
    
    if (currentPage !== totalPages) {
        currentPage = totalPages;
        renderTable();
    }
});




// 🔹 Első megjelenítés
renderTable();


document.getElementById("prevBtn").addEventListener("click", prevPage);
document.getElementById("nextBtn").addEventListener("click", nextPage);







//Alkalmazott felvétele Modal

// Gombok és a modal kiválasztása
// Modal kezelés alapfunkciók
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modal = document.getElementById('crud-modal');
const overlay = document.getElementById('overlay');
const userDeleteModal = document.getElementById('userDeleteModal');
const applyNewStaff = document.getElementById('applyNewStaff');
const applyNewStaffForm = document.getElementById('applyNewStaffForm');

// Modal megnyitása
if (openModal) {
  openModal.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    overlay.classList.remove('hidden');
  });
}

// Modal bezárása
if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
  });
}

// Bezárás, ha háttérre kattint
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  });
}

// Segédfüggvények
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

// ========== ELADÁS MODUL ==========

// Eladás beküldés
if (applyNewStaff) {
  applyNewStaff.addEventListener('click', async function(event) {
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

    // 2. TERMÉKSOROK VALIDÁLÁSA
    // Az első terméksor ellenőrzése
    const firstProductRow = document.querySelector('.productRow:not([id])'); // Az eredeti terméksor
    if (firstProductRow) {
      const selectedProduct = firstProductRow.querySelector('.selectedProduct');
      const productHiddenInput = firstProductRow.querySelector('.product_ID');

      if (selectedProduct.textContent === 'Válassz terméket' || !productHiddenInput.value) {
        showError(productHiddenInput, 'Kötelező kiválasztani egy terméket!');
        isValid = false;
      } else {
        clearError(productHiddenInput);
      }
      
      // Mennyiség validálása az első terméksornál
      const quantityInput = firstProductRow.querySelector('.quantity');
      if (!quantityInput.value || isNaN(quantityInput.value) || parseInt(quantityInput.value) <= 0) {
        showError(quantityInput, 'Kötelező megadni érvényes mennyiséget!');
        isValid = false;
      } else {
        clearError(quantityInput);
      }

      // Egységár validálása az első terméksornál
      const unitPriceInput = firstProductRow.querySelector('.productUnitPrice');
      if (unitPriceInput && (!unitPriceInput.value || isNaN(unitPriceInput.value) || parseFloat(unitPriceInput.value) <= 0)) {
        showError(unitPriceInput, 'Kötelező megadni érvényes egységárat!');
        isValid = false;
      } else if (unitPriceInput) {
        clearError(unitPriceInput);
      }
    }

   // A további terméksorok ellenőrzése
    const additionalProductRows = document.querySelectorAll('.productRowWrapper'); // minden terméksor
    additionalProductRows.forEach((rowWrapper, index) => {
      // ProductID validálása
      const productIDInput = rowWrapper.querySelector('.product_ID');
      if (productIDInput) {
        const productID = parseInt(productIDInput.value);
        if (isNaN(productID) || productID <= 0) {
          showError(productIDInput, `Kötelező kiválasztani terméket a ${index + 2}. sorban!`);
          isValid = false;
        } else {
          clearError(productIDInput);
        }
      }

      // Mennyiség validálása
      const quantityInput = rowWrapper.querySelector('.quantity');
      if (quantityInput) {
        const quantity = parseFloat(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
          showError(quantityInput, `Kötelező megadni érvényes mennyiséget a ${index + 2}. sorban!`);
          isValid = false;
        } else {
          clearError(quantityInput);
        }
      }

      // Egységár validálása
      const unitPriceInput = rowWrapper.querySelector('.productUnitPrice');
      if (unitPriceInput) {
        const unitPrice = parseFloat(unitPriceInput.value);
        if (isNaN(unitPrice) || unitPrice <= 0) {
          showError(unitPriceInput, `Kötelező megadni érvényes egységárat a ${index + 2}. sorban!`);
          isValid = false;
        } else {
          clearError(unitPriceInput);
        }
      }

      // Naplózás
      console.log(`${index + 2}. sor értékek ellenőrzése:`, { 
        productID: productIDInput ? parseInt(productIDInput.value) : 'hiányzik',
        quantity: quantityInput ? parseFloat(quantityInput.value) : 'hiányzik',
        unitPrice: unitPriceInput ? parseFloat(unitPriceInput.value) : 'hiányzik'
      });
    });

    if (isValid) {
      const form = document.getElementById('applyNewStaffForm');
      
      // Az eladó és vevő adatainak lekérése
      const sellerID = await getLoggedInStaffID();
      const customerID = parseInt(document.querySelector('input[name="customer_ID"]').value);
      
      // Ellenőrzés: van-e eladó azonosító
      if (isNaN(sellerID)) {
        alert('Hiba történt az eladó azonosításakor!');
        return;
      }

      // Ellenőrzés: van-e vevő azonosító
      if (isNaN(customerID)) {
        alert('Érvénytelen vevő azonosító!');
        return;
      }
      
      const saleData = [];
      
      // 1. Az első (eredeti) terméksor feldolgozása
      if (firstProductRow) {

        const productIDInput = firstProductRow.querySelector('.product_ID');
        const quantityInput = firstProductRow.querySelector('.quantity');
        const unitPriceInput = firstProductRow.querySelector('.productUnitPrice');
        
        if (productIDInput && quantityInput && unitPriceInput) {
          const productID = parseInt(productIDInput.value);
          const quantity = parseInt(quantityInput.value);
          const unitPrice = parseFloat(unitPriceInput.value);
          
          if (!isNaN(productID) && !isNaN(quantity) && !isNaN(unitPrice) && 
              productID > 0 && quantity > 0 && unitPrice > 0) {
            const termekSorAdat = {
              staff_ID: sellerID,
              customer_ID: customerID,
              product_ID: productID,
              quantity_sale: quantity,
              unit_price: unitPrice
            };
            
            saleData.push(termekSorAdat);
            console.log('Első terméksor sikeresen feldolgozva:', termekSorAdat);
          } else {
            console.warn('Első terméksor érvénytelen adatokkal:', { productID, quantity, unitPrice });
          }
        }
      }
      
      // 2. A további terméksorok feldolgozása
      
      additionalProductRows.forEach((row, index) => {
        
        const productIDInput = row.querySelector('.product_ID');
        const quantityInput = row.querySelector('.quantity');
        const unitPriceInput = row.querySelector('.productUnitPrice');
        
        // Ha bármelyik mező nem létezik vagy érvénytelen, ugorjuk át
        if (!productIDInput || !quantityInput || !unitPriceInput) {
          console.warn(`${index + 2}. terméksor kihagyva (hiányzó mezők).`);
          return;
        }
        
        const productID = parseInt(productIDInput.value);
        const quantity = parseInt(quantityInput.value);
        const unitPrice = parseFloat(unitPriceInput.value);
        
        if (!isNaN(productID) && !isNaN(quantity) && !isNaN(unitPrice) && 
            productID > 0 && quantity > 0 && unitPrice > 0) {
          const termekSorAdat = {
            staff_ID: sellerID,
            customer_ID: customerID,
            product_ID: productID,
            quantity_sale: quantity,
            unit_price: unitPrice
          };
          
          saleData.push(termekSorAdat);
          console.log(`${index + 2}. terméksor sikeresen feldolgozva:`, termekSorAdat);
        } else {
          console.warn(`${index + 2}. terméksor érvénytelen adatokkal:`, { productID, quantity, unitPrice });
        }
      });
      
      
      if (saleData.length === 0) {
        alert('Nem sikerült érvényes terméksorokat találni! Kérjük, ellenőrizd az adatokat.');
        return;
      }

      try {
        const response = await submitSaleData(saleData);
        
        // Sikeres válasz kezelése
        if (response) {
          // Űrlap alaphelyzetbe állítása
          form.reset();
          
          // Dropdownok alaphelyzetbe
          if (selectedCustomer) selectedCustomer.textContent = "Válassz ügyfelet";
          if (document.getElementById('customer_ID')) document.getElementById('customer_ID').value = "";
          
          // Az első terméksor alaphelyzetbe állítása
          const firstProductDropdown = document.querySelector('.selectedProduct');
          if (firstProductDropdown) {
            firstProductDropdown.textContent = "Válassz terméket";
          }
          
          // Az összes hozzáadott terméksor eltávolítása
          const productRowsContainer = document.getElementById('productRows');
          if (productRowsContainer) {
            productRowsContainer.innerHTML = '';
          }
          
          // Modal bezárása
          if (typeof modal !== 'undefined' && modal) modal.classList.add('hidden');
          if (typeof overlay !== 'undefined' && overlay) overlay.classList.add('hidden');
          
          // Sikeres üzenet
          alert('Sikeres eladás!');
          location.reload();
        } else {
          throw new Error("Hibás válasz a szervertől");
        }
      } catch (error) {
        console.error('Hiba történt:', error);
        alert(`Hiba történt: ${error.message}`);
      }
    } else {
      // Hiba esetén görgessünk az első hibaüzenethez
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

// A MEGADOTT SUBMIT FUNKCIÓ
async function submitSaleData(userData) {
  try {
    // RÉSZLETES NAPLÓZÁS

    const jsonData = JSON.stringify(userData);
    
    // Külön kiíratjuk minden termék adatait
    userData.forEach((item, index) => {
      console.log(`Termék #${index + 1} adatai:`, {
        staff_ID: item.staff_ID,
        customer_ID: item.customer_ID,
        product_ID: item.product_ID,
        quantity_sale: item.quantity_sale,
        unit_price: item.unit_price
      });
    });

    
    const response = await fetch(`${API_URL}sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hibaüzenet (nyers):", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Backend hibaüzenet (JSON):", errorData);
      } catch (e) {
        console.error("Nem sikerült JSON-ként értelmezni a hibaüzenetet");
      }
      throw new Error(`Hiba a szerveren: ${errorData?.message || response.statusText || response.status}`);
    }

    const responseText = await response.text();
    console.log("Backend válasz (nyers):", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Backend válasz (JSON-ként értelmezve):", data);
    } catch (e) {
      console.warn("Nem sikerült JSON-ként értelmezni a választ:", e);
      // Ha nem JSON a válasz, akkor a nyers szöveget adjuk vissza
      data = responseText;
    }
    
    return data;

  } catch (error) {
    console.error('Hiba történt az eladás rögzítésekor:', error);
    console.error('Hiba részletei:', error.stack);
    throw error;
  }
}

// Táblázat szerkesztés, ha használva van
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

// Globális változók a legördülő menükhöz
window.productData = [];
window.productDataLoaded = false;

// Customer legördülő menü inicializálása
document.addEventListener("DOMContentLoaded", function () {
  const dropdownBtn = document.getElementById("customerDropdownBtn");
  const dropdownOptions = document.getElementById("customerOptions");
  const selectedCustomer = document.getElementById("selectedCustomer");
  const customerInput = document.getElementById("customer_ID");

  if (!dropdownBtn || !dropdownOptions) return;

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
    fetch(`${API_URL}product`)
  ])
    .then(([saleRes, partnerRes, productRes]) => 
      Promise.all([saleRes.json(), partnerRes.json(), productRes.json()])
    )
    .then(([saleData, partnerData, productData]) => {
      // Termékek globális tárolása
      window.productData = productData;
      window.productDataLoaded = true;
      
      // Táblázat renderelés, ha kell
      if (typeof renderTable === "function") {
        window.employeesData = saleData;
        renderTable();
      }

      // Vevő dropdown feltöltése
      dropdownOptions.innerHTML = "";

      partnerData
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
        });
        
      // Termék dropdown-ok inicializálása
      initAllProductDropdowns();
    })
    .catch((error) => {
      console.error("Hiba az adatok betöltésekor:", error);
    });
});

// Termék legördülő menük inicializálása speciális hibakeresési módban
function initAllProductDropdowns() {
  
  // Ha még nem töltődtek be a termékadatok, először betöltjük
  if (!window.productDataLoaded) {
    console.warn('Termékadatok még nem töltődtek be, betöltés kezdése');
    fetchProductData();
    return;
  }
  
  const dropdownButtons = document.querySelectorAll(".productDropdownBtn");
  
  dropdownButtons.forEach((button) => {
    initProductDropdown(button);
  });
}

// Termékadatok manuális betöltése
function fetchProductData() {
  fetch(`${API_URL}product`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Nem sikerült betölteni a termékadatokat');
      }
      return response.json();
    })
    .then(productData => {
      window.productData = productData;
      window.productDataLoaded = true;
      
      // Ismét megpróbáljuk inicializálni a legördülőket
      initAllProductDropdowns();
    })
    .catch(error => {
      console.error('Hiba a termékadatok betöltésekor:', error);
    });
}

// Termék legördülő inicializálása speciális hibakeresési módban
function initProductDropdown(button) {
  
  if (!button) {
    console.warn('Nem létező gomb');
    return;
  }
  
  const parentElement = button.closest(".productRow") || button.closest(".flex-1");
  if (!parentElement) {
    console.warn('Nem található szülőelem a gombhoz', button);
    return;
  }
  
  const options = parentElement.querySelector(".productOptions");
  const selectedProduct = button.querySelector(".selectedProduct");
  const productInput = parentElement.querySelector(".product_ID");
  

  
  if (!options || !selectedProduct || !productInput) {
    console.error('Hiányzó DOM elemek a termék dropdown-hoz', { 
      options: !!options, 
      selectedProduct: !!selectedProduct, 
      productInput: !!productInput 
    });
    return;
  }

  // Kattintás esemény a legördülő gombra
  button.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    options.classList.toggle("hidden");
  });
  
  // Kattintás máshova - bezárja a legördülőt
  document.addEventListener("click", function(e) {
    if (!button.contains(e.target) && !options.contains(e.target)) {
      options.classList.add("hidden");
    }
  });
  
  // Feltöltjük a dropdown-t termékekkel
  fillProductDropdown(options, selectedProduct, productInput, parentElement);
}

// Termék dropdown feltöltése részletes hibakeresési módban
function fillProductDropdown(options, selectedProduct, productInput, parentElement) {
  
  // Ellenőrizzük, hogy be vannak-e töltve a termékek
  if (!window.productData || !Array.isArray(window.productData) || window.productData.length === 0) {
    console.warn("Még nincsenek betöltve a termékadatok");
    return;
  }
  
  options.innerHTML = "";
  
  window.productData
    .sort((a, b) => a.product_name.localeCompare(b.product_name))
    .forEach((product) => {
      const li = document.createElement("li");
      li.textContent = product.product_name;
      li.setAttribute("data-value", product.product_ID);
      li.setAttribute("data-price", product.product_profit_price || 0);
      li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
      
      li.addEventListener("click", function() {
        console.log('🖱️ Termék kiválasztva:', product);
        
        selectedProduct.textContent = product.product_name;
        productInput.value = product.product_ID;
        options.classList.add("hidden");
        
        // Az egységár beállítása
        const priceInput = parentElement.querySelector('.productUnitPrice') || 
                          parentElement.parentElement.querySelector('.productUnitPrice');
                          
        if (priceInput) {
          const price = product.product_profit_price || 0;
          priceInput.value = price;
          console.log('Egységár beállítva:', price);
        } else {
          console.warn('Nem található egységár mező');
        }
      });
      
      options.appendChild(li);
    });
}


// Inicializálás az oldal betöltésekor
document.addEventListener("DOMContentLoaded", function() {
  // Termékadatok betöltése, ha még nem történt meg
  if (!window.productDataLoaded) {
    fetchProductData();
  } else {
    initAllProductDropdowns();
  }
});

// Export a globális hatókörbe, hogy elérhető legyen máshol is
window.initAllProductDropdowns = initAllProductDropdowns;
window.initProductDropdown = initProductDropdown;

// Új terméksor hozzáadása gomb eseménykezelője
document.addEventListener("DOMContentLoaded", function() {
  const addProductButton = document.getElementById("addProductRow");
  const productGrid = document.getElementById("productRows");
  
  if (addProductButton && productGrid) {
    addProductButton.addEventListener("click", function() {
      addNewProductRow(productGrid);
    });
  }
});

// Új terméksor hozzáadása
function addNewProductRow(container) {
  const newRow = document.createElement("div");
  newRow.className = "flex flex-col sm:flex-row gap-4 w-full productRowWrapper mt-4";

  newRow.innerHTML = `
    <div class="flex-1 relative productRow">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Termék neve</label>
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
      <button type="button" class="removeProductRow text-sm text-red-500 hover:underline mt-2">
        - Termék eltávolítása
      </button>
    </div>

    <div class="flex-1">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Mennyiség</label>
      <input type="number" name="quantity" class="quantity bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Mennyiség" required>
      <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
    </div>

    <div class="flex-1">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Egységár</label>
      <input type="number" name="price" class="productUnitPrice bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Egységár" readonly>
      <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
    </div>
  `;

  container.appendChild(newRow);

  // Eseménykezelők inicializálása
  const newButton = newRow.querySelector(".productDropdownBtn");
  initProductDropdown(newButton);
  
  // Eltávolító gomb eseménykezelőjének hozzáadása
  const removeButton = newRow.querySelector(".removeProductRow");
  removeButton.addEventListener("click", function() {
    newRow.remove();
  });
}

// ========== BEVÉTELEZÉS MODUL ==========


// Konstansok definíciója - bevételezési modulhoz
const openBuyingModal = document.getElementById('openBuyingModal');
const closeBuyingModal = document.getElementById('closeBuyingModal');
const buyingModal = document.getElementById('buying-crud-modal');
const buyingOverlay = document.getElementById('overlay'); // Ugyanazt az overlay-t használjuk
const buyingForm = document.getElementById('buyingForm');
const submitBuyingButton = document.getElementById('submitBuyingForm');

// Modal logika - bevételezéshez
if (openBuyingModal) {
  openBuyingModal.addEventListener('click', () => {
    buyingModal.classList.remove('hidden');
    buyingModal.classList.add('flex');
    buyingOverlay.classList.remove('hidden');
  });
}

if (closeBuyingModal) {
  closeBuyingModal.addEventListener('click', () => {
    buyingModal.classList.add('hidden');
    buyingOverlay.classList.add('hidden');
    resetBuyingForm();
  });
}

// Bezárás, ha háttérre kattint
if (buyingModal) {
  buyingModal.addEventListener('click', (e) => {
    if (e.target === buyingModal) {
      buyingModal.classList.add('hidden');
      buyingOverlay.classList.add('hidden');
      resetBuyingForm();
    }
  });
}

// Form alaphelyzetbe állítása - bevételezéshez
function resetBuyingForm() {
  if (!buyingForm) return;
  
  buyingForm.reset();
  clearErrors(buyingForm);
  
  // Beszállító mező alaphelyzetbe
  const supplierSelect = document.getElementById('selectedSupplier');
  if (supplierSelect) {
    supplierSelect.textContent = "Válassz beszállítót";
  }
  
  // Termék mező alaphelyzetbe
  const productSelect = document.getElementById('selectedBuyingProduct');
  if (productSelect) {
    productSelect.textContent = "Válassz terméket";
  }
  
  // Termék részletek elrejtése
  const detailsContainer = document.getElementById('product-details');
  if (detailsContainer) {
    detailsContainer.classList.add('hidden');
  }
  
  // Bevételezési sorok eltávolítása
  const buyingRowsContainer = document.getElementById('buyingRows');
  if (buyingRowsContainer) {
    buyingRowsContainer.innerHTML = '';
  }
}

// Form validáció - bevételezéshez
function validateBuyingForm() {
  let isValid = true;
  
  // Beszállító validáció
  const selectedSupplier = document.getElementById('selectedSupplier');
  const supplierInput = document.getElementById('supplier_ID');
  
  if (selectedSupplier.textContent === 'Válassz beszállítót' || !supplierInput.value) {
    showError(supplierInput, 'Kötelező kiválasztani egy beszállítót!');
    isValid = false;
  } else {
    clearError(supplierInput);
  }
  
  // Az első terméksor ellenőrzése
  const firstProductRow = document.querySelector('.buyingProductRow:not([id])');
  if (firstProductRow) {
    const selectedProduct = firstProductRow.querySelector('.selectedBuyingProduct');
    const productInput = firstProductRow.querySelector('.product_ID');

    if (selectedProduct.textContent === 'Válassz terméket' || !productInput.value) {
      showError(productInput, 'Kötelező kiválasztani egy terméket!');
      isValid = false;
    } else {
      clearError(productInput);
    }
    
    // Mennyiség validálása az első terméksornál
    const quantityInput = firstProductRow.querySelector('.buyingQuantity');
    if (!quantityInput.value || isNaN(quantityInput.value) || parseInt(quantityInput.value) <= 0) {
      showError(quantityInput, 'Kötelező megadni érvényes mennyiséget!');
      isValid = false;
    } else {
      clearError(quantityInput);
    }

    // Beszerzési ár validálása az első terméksornál
    const buyPriceInput = firstProductRow.querySelector('.buyingUnitPrice');
    if (buyPriceInput && (!buyPriceInput.value || isNaN(buyPriceInput.value) || parseFloat(buyPriceInput.value) <= 0)) {
      showError(buyPriceInput, 'Kötelező megadni érvényes beszerzési árat!');
      isValid = false;
    } else if (buyPriceInput) {
      clearError(buyPriceInput);
    }
  }
  
  // A további terméksorok ellenőrzése
  const additionalBuyingRows = document.querySelectorAll('.buyingRowWrapper');
  additionalBuyingRows.forEach((rowWrapper, index) => {
    // ProductID validálása
    const productIDInput = rowWrapper.querySelector('.product_ID');
    if (productIDInput) {
      const productID = parseInt(productIDInput.value);
      if (isNaN(productID) || productID <= 0) {
        showError(productIDInput, `Kötelező kiválasztani terméket a ${index + 2}. sorban!`);
        isValid = false;
      } else {
        clearError(productIDInput);
      }
    }

    // Mennyiség validálása
    const quantityInput = rowWrapper.querySelector('.buyingQuantity');
    if (quantityInput) {
      const quantity = parseFloat(quantityInput.value);
      if (isNaN(quantity) || quantity <= 0) {
        showError(quantityInput, `Kötelező megadni érvényes mennyiséget a ${index + 2}. sorban!`);
        isValid = false;
      } else {
        clearError(quantityInput);
      }
    }

    // Beszerzési ár validálása
    const buyPriceInput = rowWrapper.querySelector('.buyingUnitPrice');
    if (buyPriceInput) {
      const buyPrice = parseFloat(buyPriceInput.value);
      if (isNaN(buyPrice) || buyPrice <= 0) {
        showError(buyPriceInput, `Kötelező megadni érvényes beszerzési árat a ${index + 2}. sorban!`);
        isValid = false;
      } else {
        clearError(buyPriceInput);
      }
    }
  });
  
  return isValid;
}

// Módosított updateProductDetails függvény
function updateProductDetails(productId) {
  if (!productId || productId === '0') {
    const detailsContainer = document.getElementById('product-details');
    if (detailsContainer) {
      detailsContainer.classList.add('hidden');
    }
    return;
  }
  
  // Keressük meg a terméket a window.productData-ból
  if (window.productData && Array.isArray(window.productData)) {
    const product = window.productData.find(p => p.product_ID == productId);
    
    if (product) {
      const detailsContainer = document.getElementById('product-details');
      if (detailsContainer) {
        detailsContainer.innerHTML = `
          <div class="bg-gray-50 p-3 rounded-md mt-3">
            <h4 class="font-medium text-gray-700">Termék adatok:</h4>
            <p><span class="text-gray-600">Aktuális készlet:</span> ${product.product_stock || 0} ${product.product_unit || 'db'}</p>
            <p><span class="text-gray-600">Utolsó beszerzési ár:</span> ${product.product_price || 0} Ft</p>
            <p><span class="text-gray-600">Ajánlott eladási ár:</span> ${product.product_profit_price || 0} Ft</p>
          </div>
        `;
        detailsContainer.classList.remove('hidden');
        
        // Megkeressük a termékhez tartozó sort, ahol a termék ki lett választva
        const parentElement = document.querySelector(`[data-value="${productId}"]`).closest('.buyingProductRow') || 
                              document.querySelector(`[data-value="${productId}"]`).closest('.buyingRowWrapper');
        
        if (parentElement) {
          const buyPriceInput = parentElement.querySelector('.buyingUnitPrice');
          if (buyPriceInput && product.product_price && (!buyPriceInput.value || buyPriceInput.value == 0)) {
            // Csak akkor állítjuk be az árat, ha még nincs beállítva vagy 0
            buyPriceInput.value = product.product_price;
            console.log("Egységár beállítva a termék részletek alapján:", product.product_price);
          }
        }
      }
    }
  }
}

// Beszállító és termék legördülő menük inicializálása
document.addEventListener("DOMContentLoaded", function () {
  const dropdownBtn = document.getElementById("supplierDropdownBtn");
  const dropdownOptions = document.getElementById("supplierOptions");
  const selectedCustomer = document.getElementById("selectedSupplier");
  const customerInput = document.getElementById("supplier_ID");

  if (!dropdownBtn || !dropdownOptions) return;

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
    fetch(`${API_URL}product`)
  ])
    .then(([saleRes, partnerRes, productRes]) => 
      Promise.all([saleRes.json(), partnerRes.json(), productRes.json()])
    )
    .then(([saleData, partnerData, productData]) => {
      // Termékek globális tárolása
      window.productData = productData;
      window.productDataLoaded = true;
      
      // Táblázat renderelés, ha kell
      if (typeof renderTable === "function") {
        window.employeesData = saleData;
        renderTable();
      }

      // Vevő dropdown feltöltése
      dropdownOptions.innerHTML = "";

      partnerData
        .filter(partner => partner.status === 1) // csak a státusz 0-ásokat engedi át
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
        });
        
      // Termék dropdown-ok inicializálása
      initAllProductDropdowns();
    })
    .catch((error) => {
      console.error("Hiba az adatok betöltésekor:", error);
    });

  
  // Termék legördülők inicializálása a már meglévő termékeknél
  initAllBuyingProductDropdowns();
  
  // Új terméksor hozzáadása gomb eseménykezelője
  const addBuyingProductButton = document.getElementById("addBuyingProductRow");
  const buyingProductGrid = document.getElementById("buyingRows");
  
  if (addBuyingProductButton && buyingProductGrid) {
    addBuyingProductButton.addEventListener("click", function() {
      addNewBuyingProductRow(buyingProductGrid);
    });
  }
  
  // Form eseménykezelő
if (submitBuyingButton && buyingForm) {
  submitBuyingButton.addEventListener("click", async function(event) {
    event.preventDefault();
    
    // Összes hibaüzenet törlése
    clearErrors(buyingForm);
    
    // Számlaszám validáció
    const billNumberInput = document.getElementById('bill_number');
    if (!billNumberInput.value.trim()) {
      showError(billNumberInput, 'Kötelező megadni a számlaszámot!');
      billNumberInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (validateBuyingForm()) {
      // Az eladó ID lekérése
      const staffID = await getLoggedInStaffID();
      const supplierID = parseInt(document.querySelector('input[name="supplier_ID"]').value);
      const billNumber = billNumberInput.value.trim(); // Számlaszám mentése
      
      // Ellenőrzés: van-e eladó és beszállító azonosító
      if (isNaN(staffID)) {
        alert('Hiba történt az eladó azonosításakor!');
        return;
      }
      
      if (isNaN(supplierID)) {
        alert('Érvénytelen beszállító azonosító!');
        return;
      }

      const buyingData = [];
      
      // DEBUG - Ellenőrizzük a DOM-ot

      const firstProductRow = document.querySelector('.buyingProductRow');

      if (firstProductRow) {
        
        const productIDInput = firstProductRow.querySelector('input.product_ID');
        const quantityInput = firstProductRow.querySelector('input.buyingQuantity');
        const buyPriceInput = firstProductRow.querySelector('input.buyingUnitPrice');
        
        console.log("Talált mezők:", {
          productIDInput: productIDInput,
          quantityInput: quantityInput,
          buyPriceInput: buyPriceInput
        });
        
        console.log("Mezők értékei:", {
          productID: productIDInput ? productIDInput.value : 'nem található',
          quantity: quantityInput ? quantityInput.value : 'nem található',
          buyPrice: buyPriceInput ? buyPriceInput.value : 'nem található'
        });
        
        if (productIDInput && quantityInput && buyPriceInput) {
          const productID = parseInt(productIDInput.value);
          const quantity = parseInt(quantityInput.value);
          const buyPrice = parseFloat(buyPriceInput.value);    
          
          if (!isNaN(productID) && !isNaN(quantity) && !isNaN(buyPrice) && 
              productID > 0 && quantity > 0 && buyPrice > 0) {
            const termekSorAdat = {
              staff_ID: staffID,
              customer_ID: supplierID,   // A backend customer_ID-t vár
              product_ID: productID,
              quantity_buy: quantity,
              bill_number: billNumber
            };
            
            buyingData.push(termekSorAdat);
            console.log('Első bevételezési sor sikeresen feldolgozva:', termekSorAdat);
          } else {
            console.warn('Első bevételezési sor érvénytelen adatokkal:', { productID, quantity, buyPrice });
          }
        } else {
          console.warn('Nem található minden szükséges mező az első bevételezési sorban');
        }
      } else {
        console.warn('Nem található az első bevételezési sor');
      }
    
      // 2. A további terméksorok feldolgozása
      console.log("TOVÁBBI BEVÉTELEZÉSI SOROK FELDOLGOZÁSA:");
      
      const additionalBuyingRows = document.querySelectorAll('.buyingRowWrapper');
      console.log(`Talált további sorok száma: ${additionalBuyingRows.length}`);
      
      additionalBuyingRows.forEach((row, index) => {
        
        const productIDInput = row.querySelector('input.product_ID');
        const quantityInput = row.querySelector('input.buyingQuantity');
        const buyPriceInput = row.querySelector('input.buyingUnitPrice');
        
        console.log(`${index + 2}. sor mezők:`, {
          productIDInput: productIDInput,
          quantityInput: quantityInput,
          buyPriceInput: buyPriceInput
        });
        
        // Ha bármelyik mező nem létezik vagy érvénytelen, ugorjuk át
        if (!productIDInput || !quantityInput || !buyPriceInput) {
          console.warn(`${index + 2}. bevételezési sor kihagyva (hiányzó mezők).`);
          return;
        }
      
        const productID = parseInt(productIDInput.value);
        const quantity = parseInt(quantityInput.value);
        const buyPrice = parseFloat(buyPriceInput.value);
        
        console.log(`${index + 2}. sor értékek:`, { productID, quantity, buyPrice });
        
        if (!isNaN(productID) && !isNaN(quantity) && !isNaN(buyPrice) && 
            productID > 0 && quantity > 0 && buyPrice > 0) {
          const termekSorAdat = {
            staff_ID: staffID,
            customer_ID: supplierID,   // A backend customer_ID-t vár
            product_ID: productID,
            quantity_buy: quantity,
            bill_number: billNumber    // Minden sor ugyanazt a bill_number-t kapja
          };
          
          buyingData.push(termekSorAdat);
          console.log(`${index + 2}. bevételezési sor sikeresen feldolgozva:`, termekSorAdat);
        } else {
          console.warn(`${index + 2}. bevételezési sor érvénytelen adatokkal:`, { productID, quantity, buyPrice });
        }
      });

      
      if (buyingData.length === 0) {
        alert('Nem sikerült érvényes terméksorokat találni!');
        return;
      }
      
      try {
        const response = await submitBuyingData(buyingData);
        
        // Sikeres válasz kezelése
        if (response) {
          // Űrlap alaphelyzetbe állítása
          resetBuyingForm();
          
          // Modal bezárása
          buyingModal.classList.add('hidden');
          buyingOverlay.classList.add('hidden');
          
          // Sikeres üzenet
          alert('Sikeres bevételezés!');
          location.reload();
        } else {
          throw new Error("Hibás válasz a szervertől");
        }
      } catch (error) {
        console.error('Hiba történt:', error);
        alert(`Hiba történt: ${error.message}`);
      }
    } else {
      // Hiba esetén görgessünk az első hibaüzenethez
      const firstError = buyingForm.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

});

// Termék legördülők inicializálása és további függvények (változatlanok maradnak)
function initAllBuyingProductDropdowns() {
  const dropdownButtons = document.querySelectorAll(".buyingProductDropdownBtn");
  dropdownButtons.forEach(button => initBuyingProductDropdown(button));
}


// Módosított legördülő termék kiválasztó inicializálása
function initBuyingProductDropdown(button) {
  if (!button) return;
  
  const parentElement = button.closest(".buyingProductRow") || button.closest(".buyingRowWrapper");
  if (!parentElement) return;
  
  const options = parentElement.querySelector(".buyingProductOptions");
  const selectedProduct = button.querySelector(".selectedBuyingProduct");
  const productInput = parentElement.querySelector(".product_ID");
  
  if (!options || !selectedProduct || !productInput) {
    console.error("Hiányzó DOM elemek a bevételezési termék dropdown-hoz", { button, options, selectedProduct, productInput });
    return;
  }

  // Kattintás esemény a legördülő gombra
  button.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    options.classList.toggle("hidden");
  });
  
  // Kattintás máshova - bezárja a legördülőt
  document.addEventListener("click", function(e) {
    if (!button.contains(e.target) && !options.contains(e.target)) {
      options.classList.add("hidden");
    }
  });
  
  // Feltöltjük a dropdown-t termékekkel
  fillBuyingProductDropdown(options, selectedProduct, productInput, parentElement);
}

function fillBuyingProductDropdown(options, selectedProduct, productInput, parentElement) {
  // Ellenőrizzük, hogy be vannak-e töltve a termékek
  if (!window.productData || !Array.isArray(window.productData) || window.productData.length === 0) {
    
    // Betöltjük a termékadatokat, ha még nincsenek betöltve
    fetch(`${API_URL}product`)
      .then(response => response.json())
      .then(productData => {
        window.productData = productData;
        window.productDataLoaded = true;
        fillBuyingProductDropdown(options, selectedProduct, productInput, parentElement);
      })
      .catch(error => {
        console.error("Hiba a termékek betöltésekor:", error);
      });
    return;
  }
  
options.innerHTML = "";
  
  window.productData
    .sort((a, b) => a.product_name.localeCompare(b.product_name))
    .forEach((product) => {
      const li = document.createElement("li");
      li.textContent = product.product_name;
      li.setAttribute("data-value", product.product_ID);
      li.setAttribute("data-price", product.product_price || 0);
      li.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
      
      li.addEventListener("click", function() {
        selectedProduct.textContent = product.product_name;
        productInput.value = product.product_ID;
        options.classList.add("hidden");
        
        // Részletes konzol napló a kiválasztott termékről
        console.log("Kiválasztott termék:", {
          id: product.product_ID,
          name: product.product_name,
          price: product.product_price || 0,
          inputValue: productInput.value
        });
        
        
        // Az egységár mindig felülírásra kerül a termék legutolsó árával
        const parentRowWrapper = parentElement.closest('.buyingRowWrapper') || 
                                 parentElement.closest('.buyingProductRow') || 
                                 parentElement.closest('form') || 
                                 parentElement.closest('.flex-col.sm\\:flex-row');
        const priceInput = parentRowWrapper ? 
            (parentRowWrapper.querySelector('.buyingUnitPrice') || 
             parentRowWrapper.querySelector('input[name="price[]"]') ||
             parentRowWrapper.closest('form').querySelector('.buyingUnitPrice') ||
             parentRowWrapper.closest('form').querySelector('input[name="price[]"]')) : 
            null;
        
        if (priceInput) {
          // Ha van ár a termékhez, akkor mindig beállítjuk
          if (product.product_price) {
            // Próbáljuk meg közvetlen módon és setAttribute-tal is
            priceInput.value = product.product_price.toString();
            priceInput.setAttribute('value', product.product_price.toString());
          } else {
            // Ha nincs ár, akkor kiürítjük a mezőt
            priceInput.value = '';
            priceInput.setAttribute('value', '');
            console.log("Nincs elérhető egységár, mező kiürítve a konkrét sorban");
          }
        } else {
          console.warn('Nem található egységár mező a konkrét sorban', { 
            parentElement, 
            parentRowWrapper, 
            product,
            parentElementClasses: parentElement.classList.toString(),
            parentElementParentClasses: parentElement.parentElement?.classList.toString()
          });
        }
        
        // Termék részletek frissítése
        updateProductDetails(product.product_ID);
      });
      
      options.appendChild(li);
    });
}


document.getElementById("addBuyProductRow").addEventListener("click", function () {
  const container = document.getElementById("BuyProductRows");
  addNewBuyingProductRow(container);
});

// Új terméksor hozzáadásakor is ellenőrizzük, hogy az árak megfelelően beállításra kerüljenek
function addNewBuyingProductRow(container) {
  const newRow = document.createElement("div");
  newRow.className = "flex flex-col sm:flex-row gap-4 w-full buyingRowWrapper mt-4";

  newRow.innerHTML = `
    <div class="flex-1 relative buyingProductRow">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Termék neve</label>
      <button type="button" class="buyingProductDropdownBtn w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 relative">
        <span class="selectedBuyingProduct">Válassz terméket</span>
        <svg class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul class="buyingProductOptions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md text-sm hidden max-h-60 overflow-auto">
      </ul>
      <input type="hidden" name="product_ID" class="product_ID" required>
      <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
      <button type="button" class="removeBuyingProductRow text-sm text-red-500 hover:underline mt-2">
        - Termék eltávolítása
      </button>
    </div>

    <div class="flex-1">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Mennyiség</label>
      <input type="number" name="quantity_buy" class="buyingQuantity bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Mennyiség" required>
      <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
    </div>

    <div class="flex-1">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Beszerzési ár</label>
      <input type="number" name="buy_price" class=" buyingUnitPrice bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Beszerzési ár" readonly>
      <span class="text-red-500 text-sm hidden">Mező kitöltése kötelező</span>
    </div>
  `;

  container.appendChild(newRow);

  // Eseménykezelők inicializálása
  const newButton = newRow.querySelector(".buyingProductDropdownBtn");
  initBuyingProductDropdown(newButton);
  
  // Eltávolító gomb eseménykezelőjének hozzáadása
  const removeButton = newRow.querySelector(".removeBuyingProductRow");
  removeButton.addEventListener("click", function() {
    newRow.remove();
  });
}
// Bevételezési adatok beküldése
async function submitBuyingData(buyingData) {
  try {
    const jsonData = JSON.stringify(buyingData);

    
    // Külön kiíratjuk minden termék adatait
    buyingData.forEach((item, index) => {
      console.log(`Termék #${index + 1} adatai:`, {
        staff_ID: item.staff_ID,
        customer_ID: item.supplier_ID,
        product_ID: item.product_ID,
        quantity_buy: item.quantity_buy,
        total_price: item.buy_price
      });
    });
    
    console.log("Hívás URL:", `${API_URL}buy`);
    console.log("Hívás metódus:", "POST");
    
    const response = await fetch(`${API_URL}buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    });
    
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hibaüzenet (nyers):", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Backend hibaüzenet (JSON):", errorData);
      } catch (e) {
        console.error("Nem sikerült JSON-ként értelmezni a hibaüzenetet");
      }
      throw new Error(`Hiba a szerveren: ${errorData?.message || response.statusText || response.status}`);
    }

    const responseText = await response.text();
    console.log("Backend válasz (nyers):", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Backend válasz (JSON-ként értelmezve):", data);
    } catch (e) {
      console.warn("Nem sikerült JSON-ként értelmezni a választ:", e);
      // Ha nem JSON a válasz, akkor a nyers szöveget adjuk vissza
      data = responseText;
    }
    return data;

  } catch (error) {
    console.error('Hiba történt a bevételezés rögzítésekor:', error);
    console.error('Hiba részletei:', error.stack);
    throw error;
  }
}



