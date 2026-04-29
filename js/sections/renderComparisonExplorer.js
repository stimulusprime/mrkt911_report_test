function formatNum(value) {
  if (value === null || value === undefined) return "н/д";
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatPct(value) {
  if (value === null || value === undefined) return "н/д";
  return `${value.toString().replace(".", ",")}%`;
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

function metricConfig(metric) {
  if (metric === "instagramViews") {
    return { label: "Instagram перегляди", unit: "переглядів", aggregate: "sum" };
  }
  if (metric === "sourceSlides") {
    return { label: "Слайди джерела", unit: "слайдів", aggregate: "sum" };
  }
  if (metric === "ppcRevenue") {
    return { label: "PPC виторг", unit: "грн", aggregate: "sum" };
  }
  return { label: "PPC сесії", unit: "сесій", aggregate: "sum" };
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
      <label>Метрика <select id="cmp-metric">
        <option value="ppcSessions">PPC сесії</option>
        <option value="ppcRevenue">PPC виторг</option>
        <option value="instagramViews">Instagram перегляди</option>
        <option value="sourceSlides">Покриття джерела (слайди)</option>
      </select></label>
      <label>Детальний місяць <select id="cmp-focus"></select></label>
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
  const metricSel = holder.querySelector("#cmp-metric");
  const focusSel = holder.querySelector("#cmp-focus");
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

  function metricValue(metric, period) {
    if (metric === "ppcRevenue") return ppcMap[period]?.revenueUah;
    if (metric === "instagramViews") return instagramMap[period];
    if (metric === "sourceSlides") return sourceIndex[period]?.slideCount || 0;
    return ppcMap[period]?.sessions;
  }

  function render() {
    if (fromSel.value > toSel.value) {
      toSel.value = fromSel.value;
    }
    const active = periods.filter((p) => inRange(p, fromSel.value, toSel.value));
    const mCfg = metricConfig(metricSel.value);
    const focus = ppcMap[focusSel.value];
    const metricValues = active.map((p) => metricValue(metricSel.value, p)).filter((v) => v !== undefined && v !== null);
    const metricSum = metricValues.reduce((s, v) => s + v, 0);
    const metricsWithData = metricValues.length;
    const focusMetric = metricValue(metricSel.value, focusSel.value);
    const focusInsight = pptxInsights[focusSel.value] || {};
    const mentions = focusInsight.channelMentions || {};

    kpiEl.innerHTML = `
      <div class="kpi-card"><div class="kpi-label">Період</div><div class="kpi-value">${labels[fromSel.value]} - ${labels[toSel.value]}</div><div class="kpi-sub neutral">${active.length} міс.</div></div>
      <div class="kpi-card"><div class="kpi-label">${mCfg.label} (сума)</div><div class="kpi-value">${formatNum(metricSum)}</div><div class="kpi-sub neutral">${mCfg.unit}; міс. з даними: ${metricsWithData}</div></div>
      <div class="kpi-card"><div class="kpi-label">PPTX/PDF покриття</div><div class="kpi-value">${active.reduce((s,p)=>s + (sourceIndex[p]?.slideCount || 0),0)}</div><div class="kpi-sub neutral">слайдів у періоді</div></div>
      <div class="kpi-card"><div class="kpi-label">Фокус: ${labels[focusSel.value]}</div><div class="kpi-value">${formatNum(focus?.revenueUah)}</div><div class="kpi-sub neutral">конверсія: ${formatPct(focus?.convPct)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Фокусна метрика</div><div class="kpi-value">${formatNum(focusMetric)}</div><div class="kpi-sub neutral">${mCfg.unit}</div></div>
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

  [fromSel, toSel, metricSel, focusSel].forEach((s) => s.addEventListener("change", render));
  render();
}
