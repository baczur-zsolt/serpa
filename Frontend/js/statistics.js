import { API_URL } from './config.js';




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

  

      // ===== 5. Összes eladás és bevétel =====
      const totalSales = data.filter(e => e.sale_ID !== null).length;
      const totalBuys = data.filter(e => e.buy_ID !== null).length;

      renderText("totalSales", totalSales);
      renderText("totalBuys", totalBuys);

     

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

      if (acc[product_name]) {
        acc[product_name] += quantity_sale;
      } else {
        acc[product_name] = quantity_sale;
      }
      return acc;
    }, {});

    const chartLabels = Object.keys(quantityData);
    const chartData = Object.values(quantityData);

    if (chartLabels.length === 0 || chartData.length === 0) {
      console.log('Nincsenek adatok a grafikonhoz.');
      return;
    }

    const backgroundColors = chartLabels.map((_, index) => getProductColor(index));

    // Pie Chart létrehozása (canvas méretének kézi beállítása)
    const profitCtx = document.getElementById('profitPieChart');
    if (!profitCtx) {
      console.error('A canvas elem nem található!');
      return;
    }

    // Méret beállítása manuálisan
    profitCtx.width = 400;
    profitCtx.height = 400;

    new Chart(profitCtx, {
      type: 'pie',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: false, // Fontos! Kézi méretezés miatt kikapcsoljuk a reszponzivitást
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  })
  .catch(error => console.error('Hiba történt:', error));

// Színválasztó segédfüggvény
function getProductColor(index) {
  const colors = [
    '#22c55e', // zöld
    '#f59e0b', // narancssárga
    '#3b82f6', // kék
    '#9333ea' // lila

  ];
  return colors[index % colors.length];
}

