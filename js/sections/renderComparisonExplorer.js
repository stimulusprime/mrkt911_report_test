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

function summarizePpc(periods, reportData) {
  const rowsMap = ppcByPeriod(reportData);
  const rows = periods.map((p) => rowsMap[p]).filter(Boolean);
  return {
    sessions: rows.reduce((s, r) => s + (r.sessions || 0), 0),
    orders: rows.reduce((s, r) => s + (r.orders || 0), 0),
    revenueUah: rows.reduce((s, r) => s + (r.revenueUah || 0), 0),
    avgConvPct: rows.length ? rows.reduce((s, r) => s + (r.convPct || 0), 0) / rows.length : null,
    monthsWithData: rows.length
  };
}

function inRange(period, from, to) {
  return period >= from && period <= to;
}

export function renderComparisonExplorer(reportData) {
  const holder = document.getElementById("history-explorer");
  if (!holder) return;

  const periods = reportData.periods || [];
  const labels = reportData.labels || {};
  const coverage = reportData.historical.sourceCoverage || [];
  const sourceIndex = reportData.historical.sourceIndexByPeriod || {};
  const ppcMap = ppcByPeriod(reportData);

  holder.innerHTML = `
    <div class="compare-controls">
      <label>З періоду <select id="cmp-from"></select></label>
      <label>До періоду <select id="cmp-to"></select></label>
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
            <th class="num">PPC сесії</th>
            <th class="num">PPC замовлення</th>
            <th class="num">PPC конверсія</th>
            <th class="num">PPC виторг (грн)</th>
          </tr>
        </thead>
        <tbody id="compare-rows"></tbody>
      </table>
    </div>
  `;

  const fromSel = holder.querySelector("#cmp-from");
  const toSel = holder.querySelector("#cmp-to");
  const focusSel = holder.querySelector("#cmp-focus");
  const kpiEl = holder.querySelector("#compare-kpis");
  const rowsEl = holder.querySelector("#compare-rows");

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

  function render() {
    if (fromSel.value > toSel.value) {
      toSel.value = fromSel.value;
    }
    const active = periods.filter((p) => inRange(p, fromSel.value, toSel.value));
    const ppcSummary = summarizePpc(active, reportData);
    const focus = ppcMap[focusSel.value];

    kpiEl.innerHTML = `
      <div class="kpi-card"><div class="kpi-label">Період</div><div class="kpi-value">${labels[fromSel.value]} - ${labels[toSel.value]}</div><div class="kpi-sub neutral">${active.length} міс.</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC сесії (сума)</div><div class="kpi-value">${formatNum(ppcSummary.sessions)}</div><div class="kpi-sub neutral">міс. з даними: ${ppcSummary.monthsWithData}</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC виторг (сума)</div><div class="kpi-value">${formatNum(ppcSummary.revenueUah)}</div><div class="kpi-sub neutral">грн</div></div>
      <div class="kpi-card"><div class="kpi-label">Фокус: ${labels[focusSel.value]}</div><div class="kpi-value">${formatNum(focus?.revenueUah)}</div><div class="kpi-sub neutral">конверсія: ${formatPct(focus?.convPct)}</div></div>
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
          <td class="num">${formatNum(row?.sessions)}</td>
          <td class="num">${formatNum(row?.orders)}</td>
          <td class="num">${formatPct(row?.convPct)}</td>
          <td class="num">${formatNum(row?.revenueUah)}</td>
        </tr>`;
      })
      .join("");
  }

  [fromSel, toSel, focusSel].forEach((s) => s.addEventListener("change", render));
  render();
}
