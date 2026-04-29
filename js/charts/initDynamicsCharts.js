const COLORS = {
  red: "#d10024",
  redDeep: "#a8001b",
  redSoft: "rgba(209,0,36,0.12)",
  ink: "#0a0a0a",
  blue: "#1a4a78",
  blueSoft: "rgba(26,74,120,0.12)",
  green: "#0e6b34",
  greenSoft: "rgba(14,107,52,0.15)",
  amber: "#b87010",
  amberSoft: "rgba(184,112,16,0.15)",
  purple: "#5b3789",
  muted: "#9a9a9a"
};

function configureChartDefaults() {
  Chart.defaults.font.family = "'Raleway', system-ui, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#6a6a6a";
  Chart.defaults.borderColor = "rgba(0,0,0,0.06)";
}

export function initDynamicsCharts(reportData) {
  if (!window.Chart || !reportData?.dynamics) return {};
  configureChartDefaults();

  const dynamics = reportData.dynamics;
  const labels = dynamics.periods.map((p) => reportData.labels[p] || p);
  const charts = {};

  charts.revenue = new Chart(document.getElementById("chRevenue"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Виторг, млн грн", data: dynamics.revenueMln, backgroundColor: [COLORS.redSoft, COLORS.red, COLORS.redDeep], borderColor: [COLORS.red, COLORS.red, COLORS.red], borderWidth: 1.5, borderRadius: 8, maxBarThickness: 80 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " млн" } }, x: { grid: { display: false } } } }
  });

  charts.margin = new Chart(document.getElementById("chMargin"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Б+Ф маржа, млн грн", data: dynamics.marginMln, backgroundColor: [COLORS.greenSoft, COLORS.green, "rgba(14,107,52,0.7)"], borderColor: COLORS.green, borderWidth: 1.5, borderRadius: 8, maxBarThickness: 80 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " млн" } }, x: { grid: { display: false } } } }
  });

  charts.channels = new Chart(document.getElementById("chChannels"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Партнерка", data: dynamics.channelsMln.partner, backgroundColor: COLORS.amber, borderRadius: 4 },
        { label: "Offline (BTL)", data: dynamics.channelsMln.btl, backgroundColor: COLORS.ink, borderRadius: 4 },
        { label: "Digital (PPC)", data: dynamics.channelsMln.ppc, backgroundColor: COLORS.red, borderRadius: 4 },
        { label: "Direct (Email)", data: dynamics.channelsMln.direct, backgroundColor: COLORS.blue, borderRadius: 4 },
        { label: "SMM", data: dynamics.channelsMln.smm, backgroundColor: COLORS.purple, borderRadius: 4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 14 } } }, scales: { y: { stacked: true, beginAtZero: true, ticks: { callback: (v) => v + " млн" } }, x: { stacked: true, grid: { display: false } } } }
  });

  charts.ppcRev = new Chart(document.getElementById("chPpcRev"), {
    type: "line",
    data: { labels, datasets: [{ label: "Виторг PPC, млн грн", data: dynamics.ppc.revenueMln, borderColor: COLORS.red, backgroundColor: COLORS.redSoft, borderWidth: 3, tension: 0.35, fill: true, pointRadius: 6, pointBackgroundColor: COLORS.red, pointBorderColor: "#fff", pointBorderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " млн" } }, x: { grid: { display: false } } } }
  });

  charts.ppcSessions = new Chart(document.getElementById("chPpcSessions"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Сесії, тис.", data: dynamics.ppc.sessionsK, backgroundColor: COLORS.red, borderRadius: 6, yAxisID: "y" }, { label: "Замовлення, тис.", data: dynamics.ppc.ordersK, backgroundColor: COLORS.blue, borderRadius: 6, yAxisID: "y1" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } }, scales: { y: { type: "linear", position: "left", beginAtZero: true, ticks: { callback: (v) => v + "к" } }, y1: { type: "linear", position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, ticks: { callback: (v) => v + "к" } }, x: { grid: { display: false } } } }
  });

  charts.email = new Chart(document.getElementById("chEmail"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Масові, тис. грн", data: dynamics.email.massK, backgroundColor: COLORS.blue, borderRadius: 6 }, { label: "Тригерні, тис. грн", data: dynamics.email.triggerK, backgroundColor: COLORS.purple, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v / 1000 + " млн" } }, x: { grid: { display: false } } } }
  });

  charts.emailBase = new Chart(document.getElementById("chEmailBase"), {
    type: "line",
    data: { labels, datasets: [{ label: "Активна Email-база", data: dynamics.email.activeBaseK, borderColor: COLORS.blue, backgroundColor: COLORS.blueSoft, borderWidth: 3, tension: 0.35, fill: true, pointRadius: 6, pointBackgroundColor: COLORS.blue, pointBorderColor: "#fff", pointBorderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, suggestedMin: 200, suggestedMax: 260, ticks: { callback: (v) => v + " тис." } }, x: { grid: { display: false } } } }
  });

  charts.smmViews = new Chart(document.getElementById("chSmmViews"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Instagram", data: dynamics.smm.viewsK.instagram, backgroundColor: COLORS.red, borderRadius: 4 }, { label: "TikTok", data: dynamics.smm.viewsK.tiktok, backgroundColor: COLORS.ink, borderRadius: 4 }, { label: "Facebook", data: dynamics.smm.viewsK.facebook, backgroundColor: COLORS.blue, borderRadius: 4 }, { label: "YouTube", data: dynamics.smm.viewsK.youtube, backgroundColor: COLORS.purple, borderRadius: 4 }, { label: "Threads", data: dynamics.smm.viewsK.threads, backgroundColor: COLORS.amber, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " тис." } }, x: { grid: { display: false } } } }
  });

  charts.smmSubs = new Chart(document.getElementById("chSmmSubs"), {
    type: "bar",
    data: { labels: ["Threads", "YouTube", "Instagram", "Facebook"], datasets: [{ label: "Приріст у березні, %", data: dynamics.smm.marchSubsGrowthPct, backgroundColor: [COLORS.amber, COLORS.purple, COLORS.blue, COLORS.green], borderRadius: 6, maxBarThickness: 42 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 2.5, ticks: { callback: (v) => v + "%" } }, x: { grid: { display: false } } } }
  });

  charts.monoRev = new Chart(document.getElementById("chMonoRev"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Виторг, млн грн", data: dynamics.monobank.revenueMln, backgroundColor: COLORS.amber, borderRadius: 6 }, { label: "Б+Ф, млн грн", data: dynamics.monobank.marginMln, backgroundColor: COLORS.green, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " млн" } }, x: { grid: { display: false } } } }
  });

  charts.monoTx = new Chart(document.getElementById("chMonoTx"), {
    type: "line",
    data: { labels, datasets: [{ label: "Транзакцій, тис.", data: dynamics.monobank.txK, borderColor: COLORS.amber, backgroundColor: COLORS.amberSoft, borderWidth: 3, tension: 0.35, fill: true, pointRadius: 6, pointBackgroundColor: COLORS.amber, pointBorderColor: "#fff", pointBorderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " тис." } }, x: { grid: { display: false } } } }
  });

  charts.promo = new Chart(document.getElementById("chPromo"), {
    type: "bar",
    data: { labels, datasets: [{ label: "E-mail+other", data: dynamics.promo.emailAndOtherK, backgroundColor: COLORS.blue, borderRadius: 4 }, { label: "Партнерка", data: dynamics.promo.partnerK, backgroundColor: COLORS.amber, borderRadius: 4 }, { label: "BTL", data: dynamics.promo.btlK, backgroundColor: COLORS.red, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + " тис" }, title: { display: true, text: "Кількість використаних промокодів" } }, x: { grid: { display: false } } } }
  });

  return charts;
}
