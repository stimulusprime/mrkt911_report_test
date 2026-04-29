function formatNum(value) {
  if (value === null || value === undefined) return "н/д";
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatPct(value) {
  if (value === null || value === undefined) return "н/д";
  return `${value.toString().replace(".", ",")}%`;
}

function formatDelta(curr, prev) {
  if (curr === null || curr === undefined || prev === null || prev === undefined || prev === 0) return "н/д";
  const delta = ((curr - prev) / prev) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1).replace(".", ",")}%`;
}

function ppcByPeriod(reportData) {
  const map = {};
  (reportData.historical.ppcByMonth || []).forEach((row) => {
    map[row.period] = row;
  });
  return map;
}

function inRange(period, from, to) {
  return period >= from && period <= to;
}

function instagramByPeriod(reportData) {
  const map = {};
  (reportData.historical.instagramViewsByMonth || []).forEach((row) => {
    map[row.period] = row.views;
  });
  return map;
}

export function renderComparisonExplorer(reportData, pptxInsights = {}) {
  const holder = document.getElementById("history-explorer");
  if (!holder) return;

  const periods = reportData.periods || [];
  const labels = reportData.labels || {};
  const coverage = reportData.historical.sourceCoverage || [];
  const sourceIndex = reportData.historical.sourceIndexByPeriod || {};
  const ppcMap = ppcByPeriod(reportData);
  const instagramMap = instagramByPeriod(reportData);

  holder.innerHTML = `
    <div class="compare-controls">
      <label>З періоду <select id="cmp-from"></select></label>
      <label>До періоду <select id="cmp-to"></select></label>
      <label>Детальний місяць <select id="cmp-focus"></select></label>
      <div class="compare-presets" id="cmp-presets">
        <button data-preset="q2">Q2'25</button>
        <button data-preset="q3">Q3'25</button>
        <button data-preset="q4">Q4'25</button>
        <button data-preset="q1">Q1'26</button>
        <button data-preset="all">Весь період</button>
      </div>
    </div>
    <div class="compare-kpis" id="compare-kpis"></div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Період</th>
            <th>Покриття</th>
            <th class="num">Слайди джерела</th>
            <th class="num">Instagram перегляди</th>
            <th class="num">PPC сесії</th>
            <th class="num">PPC замовлення</th>
            <th class="num">PPC конверсія</th>
            <th class="num">PPC виторг (грн)</th>
          </tr>
        </thead>
        <tbody id="compare-rows"></tbody>
      </table>
    </div>
    <div class="focus-insights" id="focus-insights"></div>
  `;

  const fromSel = holder.querySelector("#cmp-from");
  const toSel = holder.querySelector("#cmp-to");
  const focusSel = holder.querySelector("#cmp-focus");
  const presetsEl = holder.querySelector("#cmp-presets");
  const kpiEl = holder.querySelector("#compare-kpis");
  const rowsEl = holder.querySelector("#compare-rows");
  const focusInsightsEl = holder.querySelector("#focus-insights");

  periods.forEach((p) => {
    const text = labels[p] || p;
    [fromSel, toSel, focusSel].forEach((sel) => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = text;
      sel.appendChild(option);
    });
  });

  fromSel.value = periods[0];
  toSel.value = periods[periods.length - 1];
  focusSel.value = "2025-12";

  function sumBy(active, getter) {
    return active.reduce((sum, p) => sum + (getter(p) || 0), 0);
  }

  function previousRange(active) {
    if (!active.length) return [];
    const length = active.length;
    const startIdx = periods.indexOf(active[0]);
    const prevStart = Math.max(0, startIdx - length);
    return periods.slice(prevStart, startIdx);
  }

  function render() {
    if (fromSel.value > toSel.value) {
      toSel.value = fromSel.value;
    }
    const active = periods.filter((p) => inRange(p, fromSel.value, toSel.value));
    const prev = previousRange(active);
    const focus = ppcMap[focusSel.value];
    const activePpcSessions = sumBy(active, (p) => ppcMap[p]?.sessions);
    const activePpcRevenue = sumBy(active, (p) => ppcMap[p]?.revenueUah);
    const activeInsta = sumBy(active, (p) => instagramMap[p]);
    const activeSlides = sumBy(active, (p) => sourceIndex[p]?.slideCount);
    const prevPpcSessions = sumBy(prev, (p) => ppcMap[p]?.sessions);
    const prevPpcRevenue = sumBy(prev, (p) => ppcMap[p]?.revenueUah);
    const prevInsta = sumBy(prev, (p) => instagramMap[p]);
    const focusInsight = pptxInsights[focusSel.value] || {};
    const mentions = focusInsight.channelMentions || {};

    kpiEl.innerHTML = `
      <div class="kpi-card"><div class="kpi-label">Період</div><div class="kpi-value">${labels[fromSel.value]} - ${labels[toSel.value]}</div><div class="kpi-sub neutral">${active.length} міс.</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC сесії</div><div class="kpi-value">${formatNum(activePpcSessions)}</div><div class="kpi-sub neutral">до попер. періоду: ${formatDelta(activePpcSessions, prevPpcSessions)}</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC виторг</div><div class="kpi-value">${formatNum(activePpcRevenue)}</div><div class="kpi-sub neutral">грн; дельта: ${formatDelta(activePpcRevenue, prevPpcRevenue)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Instagram перегляди</div><div class="kpi-value">${formatNum(activeInsta)}</div><div class="kpi-sub neutral">дельта: ${formatDelta(activeInsta, prevInsta)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Покриття джерел</div><div class="kpi-value">${formatNum(activeSlides)}</div><div class="kpi-sub neutral">слайдів у періоді</div></div>
      <div class="kpi-card"><div class="kpi-label">Фокус: ${labels[focusSel.value]}</div><div class="kpi-value">${formatNum(focus?.revenueUah)}</div><div class="kpi-sub neutral">PPC конверсія: ${formatPct(focus?.convPct)}</div></div>
    `;

    rowsEl.innerHTML = active
      .map((period) => {
        const row = ppcMap[period];
        const cov = coverage.find((c) => c.period === period);
        const src = sourceIndex[period];
        return `<tr>
          <td>${labels[period] || period}</td>
          <td>${cov ? `${cov.source}${cov.hasStructuredMetrics ? "" : " (без повної структури)"}` : "н/д"}</td>
          <td class="num">${src ? src.slideCount : "0"}</td>
          <td class="num">${formatNum(instagramMap[period])}</td>
          <td class="num">${formatNum(row?.sessions)}</td>
          <td class="num">${formatNum(row?.orders)}</td>
          <td class="num">${formatPct(row?.convPct)}</td>
          <td class="num">${formatNum(row?.revenueUah)}</td>
        </tr>`;
      })
      .join("");

    focusInsightsEl.innerHTML = `
      <div class="section-head" style="margin-top:16px;">
        <div>
          <div class="label">Інсайти по фокусу</div>
          <h3 style="font-family: 'Unbounded'; font-size: 20px;">${labels[focusSel.value] || focusSel.value}</h3>
        </div>
        <div class="summary">Канал-mentions з PPTX + короткі фрагменти слайдів допомагають швидко зрозуміти контекст місяця.</div>
      </div>
      <div class="insight-chips">
        ${Object.keys(mentions).map((k)=>`<span class="insight-chip">${k}: ${mentions[k]}</span>`).join("")}
      </div>
      <div class="focus-snippets">
        ${(focusInsight.snippets || []).slice(0,4).map((s)=>`<div class="focus-snippet"><div class="meta">Слайд ${s.slide}</div><div>${s.text}</div></div>`).join("") || "<div class=\"focus-snippet\">Немає фрагментів для цього місяця.</div>"}
      </div>
    `;
  }

  presetsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-preset]");
    if (!btn) return;
    const p = btn.dataset.preset;
    if (p === "q2") { fromSel.value = "2025-04"; toSel.value = "2025-06"; }
    if (p === "q3") { fromSel.value = "2025-07"; toSel.value = "2025-09"; }
    if (p === "q4") { fromSel.value = "2025-10"; toSel.value = "2025-12"; }
    if (p === "q1") { fromSel.value = "2026-01"; toSel.value = "2026-03"; }
    if (p === "all") { fromSel.value = periods[0]; toSel.value = periods[periods.length - 1]; }
    render();
  });

  [fromSel, toSel, focusSel].forEach((s) => s.addEventListener("change", render));
  render();
}
