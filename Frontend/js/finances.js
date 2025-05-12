import { API_URL } from './config.js';



fetch(`${API_URL}finance`)
  .then(response => response.json())
  .then(data => {
    const latestFinance = data[data.length - 1];
    const balanceElement = document.getElementById('egyenlegFt');
    balanceElement.textContent = new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(latestFinance.balance);
  })
  .catch(error => {
    console.error('Hiba történt az adatok lekérése során:', error);
  });




document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Párhuzamos adatlekérés mindhárom végpontról
    const [financeData, salesData, buysData] = await Promise.all([
      fetch(`${API_URL}finance`).then(res => res.json()),
      fetch(`${API_URL}sale`).then(res => res.json()),
      fetch(`${API_URL}buy`).then(res => res.json())
      
    ]);



    
    // Adatok feldolgozása
    const now = new Date();
    const parseDate = (str) => new Date(str);

    // Eladások és vásárlások számának meghatározása
    const totalSales = salesData.length;
    const totalBuys = buysData.length;

    // Összes bevétel és kiadás számítása
    const totalRevenue = salesData.reduce((sum, sale) => 
      sum + parseFloat(sale.total_price), 0);
    const totalExpenses = buysData.reduce((sum, buy) => 
      sum + parseFloat(buy.total_price), 0);

    // ===== Segédfüggvények =====
    const filterByDays = (days) => {
      const from = new Date(now);
      from.setDate(now.getDate() - days);
      return financeData.filter(entry => parseDate(entry.date) >= from);
    };

    const groupBy = (arr, keyFn) =>
      arr.reduce((acc, entry) => {
        const key = keyFn(parseDate(entry.date));
        acc[key] = parseFloat(entry.balance);
        return acc;
      }, {});

    const renderText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    const createChart = (type, canvasId, labels, datasets, xLabel = 'Idő', yLabel = 'Ft') => {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      new Chart(ctx, {
        type,
        data: { labels, datasets },
        options: {
          responsive: true,
          animation: { duration: 1000, easing: 'easeOutQuart' },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: yLabel } },
            x: { title: { display: true, text: xLabel } }
          }
        }
      });
    };

    const createLineChartFromData = (canvasId, chartData, label) => {
      createChart('line', canvasId, Object.keys(chartData), [{
        label,
        data: Object.values(chartData),
        borderColor: 'rgba(0, 157, 247, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }]);
    };

    // Sales és Buy adatok feldolgozása, date mezők alapján
    const processSalesByDate = (days) => {
      const from = new Date(now);
      from.setDate(now.getDate() - days);
      
      // Szűrés dátum alapján
      const filteredSales = salesData.filter(sale => {
        const saleDate = parseDate(sale.sale_date);
        return saleDate >= from;
      });
      
      // Csoportosítás dátum szerint
      return filteredSales.reduce((acc, sale) => {
        const date = parseDate(sale.sale_date);
        const key = date.toLocaleDateString('hu-HU', { day: 'numeric', month: 'short' });
        if (!acc[key]) acc[key] = 0;
        acc[key] += parseFloat(sale.total_price);
        return acc;
      }, {});
    };

    const processBuysByDate = (days) => {
      const from = new Date(now);
      from.setDate(now.getDate() - days);
      
      // Szűrés dátum alapján
      const filteredBuys = buysData.filter(buy => {
        const buyDate = parseDate(buy.buy_date || buy.purchase_date); // Ellenőrizzük mindkét lehetséges mezőnevet
        return buyDate >= from;
      });
      
      // Csoportosítás dátum szerint
      return filteredBuys.reduce((acc, buy) => {
        const date = parseDate(buy.buy_date || buy.purchase_date);
        const key = date.toLocaleDateString('hu-HU', { day: 'numeric', month: 'short' });
        if (!acc[key]) acc[key] = 0;
        acc[key] += parseFloat(buy.total_price);
        return acc;
      }, {});
    };

    // ===== 1. Napi kimutatás (7 nap) =====
    const weeklyData = filterByDays(7);
    const daily = groupBy(weeklyData, d =>
      d.toLocaleDateString('hu-HU', { weekday: 'short', day: 'numeric', month: 'short' })
    );

    // ===== 2. Heti kimutatás (30 nap) =====
// ===== 2. Heti kimutatás (30 nap) =====
// Módosított kód, pontosan az előző 30 napot mutatja heti bontásban
const monthlyData = [];
// Használjuk a már definiált "now" változót a mai dátumhoz az "today" helyett

// Heti időszakok generálása az előző 30 napra
const numberOfWeeks = 5; // 5 hét lefedi a 30 napot, és biztosít némi átfedést
const daysPerWeek = 7;

for (let weekIndex = numberOfWeeks - 1; weekIndex >= 0; weekIndex--) {
  // Az adott hét kezdő és záró napjai
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() - (weekIndex * daysPerWeek));
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - (daysPerWeek - 1));
  
  // Csak akkor vegyük figyelembe, ha ez az időszak az előző 30 napon belül van
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  // Ha a hét kezdete régebbi mint 30 nappal ezelőtt, akkor ugorjuk át
  if (weekStart < thirtyDaysAgo) {
    continue;
  }
  
  // Szűrjük az adott hétre eső pénzügyi bejegyzéseket
  const weekEntries = financeData.filter(entry => {
    const entryDate = parseDate(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
  
  let weekBalance = null;
  
  // Ha van adat az adott hétre, vegyük a legfrissebbet
  if (weekEntries.length > 0) {
    const lastEntry = weekEntries[weekEntries.length - 1];
    weekBalance = parseFloat(lastEntry.balance);
  } 
  // Ha nincs, akkor keresünk egy korábbi értéket a héthez
  else {
    // Keresünk egy korábbi bejegyzést ami a legközelebb áll a héthez
    const previousEntries = financeData.filter(entry => 
      parseDate(entry.date) < weekStart
    );
    
    if (previousEntries.length > 0) {
      // Vegyük a legfrissebbet a megelőző időszakból
      const lastPreviousEntry = previousEntries[previousEntries.length - 1];
      weekBalance = parseFloat(lastPreviousEntry.balance);
    } else if (financeData.length > 0) {
      // Ha nincs korábbi érték, használjuk az első rendelkezésre álló adatot
      weekBalance = parseFloat(financeData[0].balance);
    } else {
      // Ha semmilyen adat nincs, állítsuk 0-ra
      weekBalance = 0;
    }
  }
  
  // A hét formázása "hónap, nap - hónap, nap" formában
  const weekKey = `${weekStart.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}`;
  
  monthlyData.push({
    date: weekKey,
    balance: weekBalance
  });
}

// A heti adatok objektummá alakítása
const weekly = monthlyData.reduce((acc, entry) => {
  acc[entry.date] = entry.balance;
  return acc;
}, {});

    // ===== 3. Havi kimutatás (12 hónap) =====
   // ===== 3. Havi kimutatás (12 hónap) =====
// Módosított kód, minden hónapot mutat az előző 12 hónapból
const yearlyData = [];
// Használjuk a már korábban definiált "now" változót az "today" helyett

// Az előző 12 hónap generálása
for (let i = 11; i >= 0; i--) {
  const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
  
  // Szűrjük az adott hónapra eső bejegyzéseket
  const monthEntries = financeData.filter(entry => {
    const entryDate = parseDate(entry.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });
  
  let monthBalance = null;
  
  // Ha van adat az adott hónapból, vegyük a legfrissebbet
  if (monthEntries.length > 0) {
    const lastEntry = monthEntries[monthEntries.length - 1];
    monthBalance = parseFloat(lastEntry.balance);
  } 
  // Ha nincs, akkor keresünk egy korábbi értéket a hónaphoz
  else {
    // Keresünk egy korábbi bejegyzést ami a legközelebb áll a hónaphoz
    const previousEntries = financeData.filter(entry => 
      parseDate(entry.date) < monthStart
    );
    
    if (previousEntries.length > 0) {
      // Vegyük a legfrissebbet a megelőző időszakból
      const lastPreviousEntry = previousEntries[previousEntries.length - 1];
      monthBalance = parseFloat(lastPreviousEntry.balance);
    } else if (financeData.length > 0) {
      // Ha nincs korábbi érték, használjuk az első rendelkezésre álló adatot
      monthBalance = parseFloat(financeData[0].balance);
    } else {
      // Ha semmilyen adat nincs, állítsuk 0-ra
      monthBalance = 0;
    }
  }
  
  // Hónap és év formázása 
  const monthKey = monthStart.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
  
  yearlyData.push({
    date: monthKey,
    balance: monthBalance
  });
}

// A havi adatok objektummá alakítása
const monthly = yearlyData.reduce((acc, entry) => {
  acc[entry.date] = entry.balance;
  return acc;
}, {});

    // ===== 4. Profit kiszámítás =====
    const startBalance = parseFloat(financeData[0].balance);
    const endBalance = parseFloat(financeData[financeData.length - 1].balance);
    const profit = endBalance - startBalance;
    const profitPercent = ((profit / startBalance) * 100).toFixed(2);

    renderText("profitFt", `${profit.toLocaleString()} Ft`);
    renderText("profitPercent", `${profitPercent}%`);

    // ===== 5. Összes eladás és bevétel =====
    renderText("totalSales", totalSales);
    renderText("totalBuys", totalBuys);
    
    // Opcionális: teljes bevétel és kiadás megjelenítése
    if (document.getElementById("totalRevenue")) {
      renderText("totalRevenue", `${totalRevenue.toLocaleString()} Ft`);
    }
    if (document.getElementById("totalExpenses")) {
      renderText("totalExpenses", `${totalExpenses.toLocaleString()} Ft`);
    }

    // ===== 6. Havi bevétel és kiadás összegzése a pontos adatok alapján =====
    const monthlyStats = {};
    
    // Sales adatok feldolgozása havi csoportosítással
    salesData.forEach(sale => {
      const d = parseDate(sale.sale_date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyStats[key]) monthlyStats[key] = { revenue: 0, expense: 0 };
      monthlyStats[key].revenue += parseFloat(sale.total_price);  // Sale → Bevétel
    });
    
    // Buy adatok feldolgozása havi csoportosítással
    buysData.forEach(buy => {
      const d = parseDate(buy.buy_date || buy.purchase_date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyStats[key]) monthlyStats[key] = { revenue: 0, expense: 0 };
      monthlyStats[key].expense += parseFloat(buy.total_price);  // Buy → Kiadás
    });

    const monthLabels = Object.keys(monthlyStats).sort();
    const revenueData = monthLabels.map(m => monthlyStats[m].revenue);
    const expenseData = monthLabels.map(m => monthlyStats[m].expense);

    createChart('bar', 'monthlyIncomeExpenseChart', monthLabels, [
      {
        label: 'Bevétel',
        data: revenueData,
        backgroundColor: 'rgba(34,197,94,0.6)',
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 1
      },
      {
        label: 'Kiadás',
        data: expenseData,
        backgroundColor: 'rgba(239,68,68,0.6)',
        borderColor: '#ff6666',
        borderWidth: 1
      }
    ]);

    // ===== 7. Trendvonalak =====
    createLineChartFromData('weeklyChart', daily, 'Utolsó 7 nap');
    createLineChartFromData('monthlyChart', weekly, 'Utolsó 30 nap');
    createLineChartFromData('yearlyChart', monthly, 'Utolsó 12 hónap');

    // ===== 8. 30 napos Bevétel / Kiadás pontosabb adatokkal =====
    const salesLast30Days = processSalesByDate(30);
    const buysLast30Days = processBuysByDate(30);

    const combinedLabels = Array.from(new Set([
      ...Object.keys(salesLast30Days),
      ...Object.keys(buysLast30Days)
    ])).sort((a, b) => {
      const dateA = new Date(a.split('. ')[1] + '. ' + a.split('. ')[0]);
      const dateB = new Date(b.split('. ')[1] + '. ' + b.split('. ')[0]);
      return dateA - dateB;
    });

    const combinedSalesData = combinedLabels.map(label => salesLast30Days[label] || 0);
    const combinedBuysData = combinedLabels.map(label => buysLast30Days[label] || 0);

    createChart('line', 'incomeExpenseLineChart', combinedLabels, [
      {
        label: 'Bevétel',
        data: combinedSalesData,  // Sales = Bevétel (revenue)
        borderColor: 'rgba(102, 204, 102, 1)', 
        backgroundColor: 'rgba(34, 197, 94, 0.2)', 
        tension: 0.4,
        fill: true
      },
      {
        label: 'Kiadás',
        data: combinedBuysData,  // Buys = Kiadás (expense)
        borderColor: '#ff6666',
        backgroundColor: 'hsla(0, 75.40%, 49.40%, 0.20)',
        tension: 0.4,
        fill: true
      }
    ], 'Nap');

    // ===== 9. Bevétel oszlopdiagram =====
    createChart('bar', 'incomeBarChart', Object.keys(salesLast30Days), [
      {
        label: 'Bevétel',
        data: Object.values(salesLast30Days),
        backgroundColor: 'rgba(102, 204, 102, 1)',
        borderColor: 'rgba(102, 204, 102, 1)',
        borderWidth: 1
      }
    ]);

    // ===== 10. Kiadás oszlopdiagram =====
    createChart('bar', 'expenseBarChart', Object.keys(buysLast30Days), [
      {
        label: 'Kiadás',
        data: Object.values(buysLast30Days),
        backgroundColor: '#ff6666',
        borderColor: '#ff6666',
        borderWidth: 1
      }
    ]);

    // ===== 11. 30 napos egyenlegváltozás =====
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const balancesLast30Days = financeData.filter(e => parseDate(e.date) >= thirtyDaysAgo);

    const start30 = parseFloat(balancesLast30Days[0]?.balance || endBalance);
    const end30 = parseFloat(balancesLast30Days.at(-1)?.balance || endBalance);
    const changePercent30 = (((end30 - start30) / start30) * 100).toFixed(2);

    renderText("changePercent30", `${changePercent30}%`);
    
  } catch (error) {
    console.error("Hiba történt az adatok lekérése során:", error);
    // Opcionális: hibaüzenet megjelenítése a felhasználói felületen
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
      errorContainer.textContent = "Hiba történt az adatok betöltésekor. Kérjük, próbálja újra később.";
      errorContainer.style.display = "block";
    }
  }
});