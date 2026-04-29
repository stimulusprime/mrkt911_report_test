import { initDynamicsCharts } from "./charts/initDynamicsCharts.js";
import { renderComparisonExplorer } from "./sections/renderComparisonExplorer.js";
import { renderDecemberPpcTable } from "./sections/renderHistoricalSections.js";

const reportData = window.REPORT_DATA || {};
const pptxInsights = window.PPTX_INSIGHTS || {};
const charts = initDynamicsCharts(reportData);
renderDecemberPpcTable(reportData);
renderComparisonExplorer(reportData, pptxInsights);

function renderArchiveMonth(period) {
  const title = document.getElementById("archive-title-main");
  const kpis = document.getElementById("archive-kpis");
  const table = document.getElementById("archive-table");
  const note = document.getElementById("archive-note");
  if (!title || !kpis || !table || !note) return;

  const rows = reportData?.historical?.ppcByMonth || [];
  const labels = reportData?.labels || {};
  const rowMap = {};
  rows.forEach((r) => {
    rowMap[r.period] = r;
  });
  const current = rowMap[period];
  if (!current) return;
  const idx = reportData.periods.indexOf(period);
  const nextPeriod = reportData.periods[idx + 1];
  const next = rowMap[nextPeriod];
  const formatNum = (v) => new Intl.NumberFormat("uk-UA").format(v || 0);
  const formatPct = (v) => `${(v || 0).toString().replace(".", ",")}%`;
  const deltaPct = (a, b) => (!b ? "—" : `${(((a - b) / b) * 100 >= 0 ? "+" : "")}${(((a - b) / b) * 100).toFixed(1).replace(".", ",")}%`);

  title.textContent = `${labels[period] || period}.`;
  kpis.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">PPC виторг</div><div class="kpi-value">${formatNum(current.revenueUah)}</div><div class="kpi-sub neutral">грн</div></div>
    <div class="kpi-card"><div class="kpi-label">PPC сесії</div><div class="kpi-value">${formatNum(current.sessions)}</div><div class="kpi-sub neutral">частка ${formatPct(current.sharePct)}</div></div>
    <div class="kpi-card"><div class="kpi-label">PPC замовлення</div><div class="kpi-value">${formatNum(current.orders)}</div><div class="kpi-sub neutral">CR ${formatPct(current.convPct)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Сер. чек</div><div class="kpi-value">${formatNum(current.avgCheckUah)}</div><div class="kpi-sub neutral">грн</div></div>
  `;

  table.innerHTML = `
    <thead><tr><th>Період</th><th class="num">Сесії</th><th class="num">Замовлення</th><th class="num">CR</th><th class="num">Виторг, грн</th><th class="num">Сер. чек</th></tr></thead>
    <tbody>
      <tr style="font-weight:700"><td>${labels[period] || period}</td><td class="num">${formatNum(current.sessions)}</td><td class="num">${formatNum(current.orders)}</td><td class="num">${formatPct(current.convPct)}</td><td class="num">${formatNum(current.revenueUah)}</td><td class="num">${formatNum(current.avgCheckUah)}</td></tr>
      ${next ? `<tr><td>${labels[nextPeriod] || nextPeriod}</td><td class="num">${formatNum(next.sessions)}</td><td class="num">${formatNum(next.orders)}</td><td class="num">${formatPct(next.convPct)}</td><td class="num">${formatNum(next.revenueUah)}</td><td class="num">${formatNum(next.avgCheckUah)}</td></tr>` : ""}
    </tbody>
  `;
  note.textContent = next
    ? `Динаміка до наступного місяця (${labels[nextPeriod]}): сесії ${deltaPct(next.sessions, current.sessions)}, виторг ${deltaPct(next.revenueUah, current.revenueUah)}.`
    : "Для цього місяця немає наступного періоду у вибірці.";
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      pages.forEach((p) => p.classList.remove("active"));
      const next = document.getElementById(`page-${target}`);
      if (next) next.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        Object.values(charts).forEach((chart) => chart?.resize?.());
      }, 100);
    });
  });
}

function setupParallax() {
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  let ticking = false;

  function update() {
    const scrolled = window.pageYOffset;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || "0");
      const offset = scrolled * speed;
      el.style.transform = el.classList.contains("hero-logo")
        ? `translateY(calc(-50% + ${offset}px)) rotate(${offset * 0.05}deg)`
        : `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function setupTopPeriodNav(reportData) {
  const select = document.getElementById("top-period-select");
  const tabs = document.querySelectorAll(".tab");
  if (!select || !reportData?.periods) return;

  const monthToPage = {
    "2026-03": "march",
    "2026-02": "february",
    "2026-01": "january",
    "2025-09": "september",
    "2025-10": "october",
    "2025-11": "november",
    "2025-12": "december"
  };

  reportData.periods.forEach((period) => {
    const option = document.createElement("option");
    option.value = period;
    option.textContent = monthToPage[period]
      ? (reportData.labels?.[period] || period)
      : `${reportData.labels?.[period] || period} (далі)`;
    select.appendChild(option);
  });
  select.value = "2025-12";

  select.addEventListener("change", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    const targetPage = monthToPage[select.value] || "archive";
    const targetTab = document.querySelector(`.tab[data-target="${targetPage}"]`) || document.querySelector('.tab[data-target="dynamics"]');
    if (targetTab) targetTab.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(`page-${targetPage}`)?.classList.add("active");
    if (targetPage === "archive") {
      renderArchiveMonth(select.value);
    }
    const localMain = document.getElementById("cmp-main");
    if (localMain && Array.from(localMain.options).some((o) => o.value === select.value)) {
      localMain.value = select.value;
      localMain.dispatchEvent(new Event("change"));
    }
    if (targetPage === "dynamics" || targetPage === "archive") {
      document.getElementById("history-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

setupTabs();
setupParallax();
setupTopPeriodNav(reportData);
