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
  const focus = document.getElementById("cmp-focus");
  const tabs = document.querySelectorAll(".tab");
  if (!select || !reportData?.periods) return;

  reportData.periods.forEach((period) => {
    const option = document.createElement("option");
    option.value = period;
    option.textContent = reportData.labels?.[period] || period;
    select.appendChild(option);
  });
  select.value = "2025-12";

  select.addEventListener("change", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    const dynTab = document.querySelector('.tab[data-target="dynamics"]');
    if (dynTab) dynTab.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById("page-dynamics")?.classList.add("active");
    const localFocus = document.getElementById("cmp-focus");
    if (localFocus) {
      localFocus.value = select.value;
      localFocus.dispatchEvent(new Event("change"));
    }
    document.getElementById("history-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

setupTabs();
setupParallax();
setupTopPeriodNav(reportData);
