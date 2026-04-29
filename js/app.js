import { initDynamicsCharts } from "./charts/initDynamicsCharts.js";
import { renderComparisonExplorer } from "./sections/renderComparisonExplorer.js";
import { renderDecemberPpcTable } from "./sections/renderHistoricalSections.js";

const reportData = window.REPORT_DATA || {};
const pptxInsights = window.PPTX_INSIGHTS || {};
const charts = initDynamicsCharts(reportData);
renderDecemberPpcTable(reportData);
renderComparisonExplorer(reportData, pptxInsights);

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
    const targetPage = monthToPage[select.value] || "dynamics";
    const targetTab = document.querySelector(`.tab[data-target="${targetPage}"]`) || document.querySelector('.tab[data-target="dynamics"]');
    if (targetTab) targetTab.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(`page-${targetPage}`)?.classList.add("active");
    const localMain = document.getElementById("cmp-main");
    if (localMain && Array.from(localMain.options).some((o) => o.value === select.value)) {
      localMain.value = select.value;
      localMain.dispatchEvent(new Event("change"));
    }
    if (targetPage === "dynamics") {
      document.getElementById("history-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

setupTabs();
setupParallax();
setupTopPeriodNav(reportData);
