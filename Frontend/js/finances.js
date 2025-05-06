import { API_URL } from './config.js';


fetch(`${API_URL}finance`)
  .then(response => response.json())  // Az adatokat JSON formátumban várjuk
  .then(data => {
    // A legutolsó adat kiválasztása
    const latestFinance = data[data.length - 1];  // Az utolsó elem

    // A balance kiíratása a HTML-be
    const balanceElement = document.getElementById('egyenlegFt');  // Az elem, ahol megjelenítjük
    balanceElement.textContent = latestFinance.balance;  // A balance értéke kiírása

    // Ha szükséges, itt más adatokat is kiírhatsz
  })
  .catch(error => {
    console.error('Hiba történt az adatok lekérése során:', error);
  });

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_URL}finance`)
    .then(res => res.json())
    .then(data => {
      const now = new Date();
      const parseDate = (str) => new Date(str);

      // ===== Segédfüggvények =====
      const filterByDays = (days) => {
        const from = new Date(now);
        from.setDate(now.getDate() - days);
        return data.filter(entry => parseDate(entry.date) >= from);
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

      // ===== 1. Napi kimutatás (7 nap) =====
      const weeklyData = filterByDays(7);
      const daily = groupBy(weeklyData, d =>
        d.toLocaleDateString('hu-HU', { weekday: 'short', day: 'numeric', month: 'short' })
      );

      // ===== 2. Heti kimutatás (30 nap) =====
      const monthlyData = filterByDays(30);
      const weekly = groupBy(monthlyData, d => {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        return startOfWeek.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
      });

      // ===== 3. Havi kimutatás (12 hónap) =====
      const yearlyData = filterByDays(365);
      const monthly = groupBy(yearlyData, d =>
        d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })
      );

      // ===== 4. Profit kiszámítás =====
      const startBalance = parseFloat(data[0].balance);
      const endBalance = parseFloat(data[data.length - 1].balance);
      const profit = endBalance - startBalance;
      const profitPercent = ((profit / startBalance) * 100).toFixed(2);

      renderText("profitFt", `${profit.toLocaleString()} Ft`);
      renderText("profitPercent", `${profitPercent}%`);

      // ===== 5. Összes eladás és bevétel =====
      const totalSales = data.filter(e => e.sale_ID !== null).length;
      const totalBuys = data.filter(e => e.buy_ID !== null).length;

      renderText("totalSales", totalSales);
      renderText("totalBuys", totalBuys);

      // ===== 6. Havi bevétel és kiadás összegzése =====
      const monthlyStats = {};
      data.forEach(entry => {
        const d = parseDate(entry.date);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlyStats[key]) monthlyStats[key] = { revenue: 0, expense: 0 };
        const value = parseFloat(entry.balance);
        if (entry.sale_ID !== null) monthlyStats[key].revenue += value;
        if (entry.buy_ID !== null) monthlyStats[key].expense += value;
      });

      const monthLabels = Object.keys(monthlyStats);
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

      // ===== 8. 30 napos Bevétel / Kiadás =====
      const last30Days = filterByDays(30);
      const incomeChartData = groupBy(last30Days.filter(e => e.sale_ID !== null), d =>
        d.toLocaleDateString('hu-HU', { day: 'numeric', month: 'short' })
      );
      const expenseChartData = groupBy(last30Days.filter(e => e.buy_ID !== null), d =>
        d.toLocaleDateString('hu-HU', { day: 'numeric', month: 'short' })
      );

      const combinedLabels = Array.from(new Set([
        ...Object.keys(incomeChartData),
        ...Object.keys(expenseChartData)
      ])).sort((a, b) => new Date(a) - new Date(b));

      const combinedIncomeData = combinedLabels.map(label => incomeChartData[label] || 0);
      const combinedExpenseData = combinedLabels.map(label => expenseChartData[label] || 0);

      createChart('line', 'incomeExpenseLineChart', combinedLabels, [
        {
          label: 'Bevétel',
          data: combinedIncomeData,
          borderColor: 'rgba(102, 204, 102, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Kiadás',
          data: combinedExpenseData,
          borderColor: '#ff6666',
          backgroundColor: 'hsla(0, 84.20%, 60.20%, 0.21)',
          tension: 0.4,
          fill: true
        }
      ], 'Nap');

      // ===== 9. Bevétel oszlopdiagram =====
      createChart('bar', 'incomeBarChart', Object.keys(incomeChartData), [
        {
          label: 'Bevétel',
          data: Object.values(incomeChartData),
          backgroundColor: 'rgba(102, 204, 102, 1)',
          borderColor: 'rgba(102, 204, 102, 1)',
          borderWidth: 1
        }
      ]);

      // ===== 10. Kiadás oszlopdiagram =====
      createChart('bar', 'expenseBarChart', Object.keys(expenseChartData), [
        {
          label: 'Kiadás',
          data: Object.values(expenseChartData),
          backgroundColor: '#ff6666',
          borderColor: '#ff6666',
          borderWidth: 1
        }
      ]);

      // ===== 11. 30 napos egyenlegváltozás =====
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const balancesLast30Days = data.filter(e => parseDate(e.date) >= thirtyDaysAgo);

      const start30 = parseFloat(balancesLast30Days[0]?.balance || endBalance);
      const end30 = parseFloat(balancesLast30Days.at(-1)?.balance || endBalance);
      const changePercent30 = (((end30 - start30) / start30) * 100).toFixed(2);

      renderText("changePercent30", `${changePercent30}%`);
    });
});

const balanceCtx = document.getElementById('balanceChart');
new Chart(balanceCtx, {
  type: 'line',
  data: {
    labels: ["2025-04-28 12:24", "2025-04-28 12:25"],
    datasets: [{
      label: 'Egyenleg (Ft)',
      data: [10000000, 10180000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: false }
    }
  }
});

    
    // API kérés a /sale végpontról
    fetch(`${API_URL}sale`)
    .then(res => {
        if (!res.ok) {
          throw new Error('Hiba történt a válasz lekérésekor!');
        }
        return res.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          console.log('Nincsenek eladási adatok.');
          return;
        }
    
        // Eladott mennyiség alapján a legnépszerűbb termékek kiszámítása
        const quantityData = data.reduce((acc, entry) => {
          const { product_name, quantity_sale } = entry;
    
          // Ha már létezik ilyen termék, hozzáadjuk az eladott mennyiséget
          if (acc[product_name]) {
            acc[product_name] += quantity_sale;
          } else {
            // Ha még nem létezett a termék, akkor létrehozzuk
            acc[product_name] = quantity_sale;
          }
          return acc;
        }, {});
    
        // Adatok formázása a Pie charthoz
        const chartLabels = Object.keys(quantityData);
        const chartData = Object.values(quantityData);
    
        // Ha nincsenek termékek, ne jelenjen meg a grafikon
        if (chartLabels.length === 0 || chartData.length === 0) {
          console.log('Nincsenek adatok a grafikonhoz.');
          return;
        }
    
        // Színek hozzárendelése a termékekhez
        const backgroundColors = chartLabels.map((_, index) => getProductColor(index));
    
        // Pie Chart létrehozása
        const profitCtx = document.getElementById('profitPieChart');
        if (!profitCtx) {
          console.error('A canvas elem nem található!');
          return;
        }
    
        new Chart(profitCtx, {
          type: 'pie',
          data: {
            labels: chartLabels,  // Termékek nevei
            datasets: [{
              data: chartData,  // Eladott mennyiségek
              backgroundColor: backgroundColors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      })
      .catch(error => console.error('Hiba történt:', error));
    
    // Segédfüggvény a termékek színeinek meghatározásához
    function getProductColor(index) {
      const colors = [
        '#22c55e', // zöld
        '#f59e0b', // narancssárga
        '#3b82f6', // kék
        '#9333ea', // lila
        '#e11d48'  // piros
      ];
      return colors[index % colors.length]; // A színek körbefordulnak, ha több termék van
    }


    // Bubble Chart – Eladás mennyiség és bevétel
    const bubbleCtx = document.getElementById('bubbleChart');
    new Chart(bubbleCtx, {
      type: 'bubble',
      data: {
        datasets: [
          {
            label: "Fiskars Benzines Fűnyíró",
            data: [{ x: 2, y: 180000, r: 10 }],
            backgroundColor: '#60a5fa'
          },
          {
            label: "Stihl Láncfűrész MS 180",
            data: [{ x: 1, y: 60000, r: 5 }],
            backgroundColor: '#f87171'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Eladott mennyiség' },
            beginAtZero: true
          },
          y: {
            title: { display: true, text: 'Bevétel (Ft)' },
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `Mennyiség: ${ctx.raw.x}, Bevétel: ${ctx.raw.y.toLocaleString()} Ft`
            }
          }
        }
      }
    });