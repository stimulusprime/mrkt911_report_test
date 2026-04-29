function formatNum(value) {
  if (value === null || value === undefined) return "н/д";
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatPct(value) {
  if (value === null || value === undefined) return "0%";
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
  const ppcMap = ppcByPeriod(reportData);
  const instagramMap = instagramByPeriod(reportData);
  const availableMonths = periods.filter((p) => ppcMap[p] && instagramMap[p]);
  if (!availableMonths.length) return;

  holder.innerHTML = `
    <div class="compare-controls">
      <label>Місяць звіту <select id="cmp-main"></select></label>
      <label>Порівняти з <select id="cmp-compare"></select></label>
      <div class="compare-presets" id="cmp-presets">
        <button data-preset="prev">Попередній місяць</button>
        <button data-preset="qoq">Квартал до кварталу</button>
      </div>
    </div>
    <div class="compare-kpis" id="compare-kpis"></div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Метрика</th>
            <th class="num">Обраний місяць</th>
            <th class="num">Місяць порівняння</th>
            <th class="num">Різниця</th>
          </tr>
        </thead>
        <tbody id="compare-rows"></tbody>
      </table>
    </div>
    <div class="focus-insights" id="focus-insights"></div>
  `;

  const mainSel = holder.querySelector("#cmp-main");
  const compareSel = holder.querySelector("#cmp-compare");
  const presetsEl = holder.querySelector("#cmp-presets");
  const kpiEl = holder.querySelector("#compare-kpis");
  const rowsEl = holder.querySelector("#compare-rows");
  const focusInsightsEl = holder.querySelector("#focus-insights");

  availableMonths.forEach((p) => {
    const text = labels[p] || p;
    [mainSel, compareSel].forEach((sel) => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = text;
      sel.appendChild(option);
    });
  });

  mainSel.value = availableMonths[availableMonths.length - 1];
  compareSel.value = availableMonths[availableMonths.length - 2] || availableMonths[0];

  function render() {
    const m = mainSel.value;
    const c = compareSel.value;
    const current = ppcMap[m];
    const prev = ppcMap[c];
    const currentInsta = instagramMap[m] || 0;
    const prevInsta = instagramMap[c] || 0;
    const focusInsight = pptxInsights[m] || {};
    const mentions = focusInsight.channelMentions || {};

    const deltaRevenue = (current?.revenueUah || 0) - (prev?.revenueUah || 0);
    const deltaSessions = (current?.sessions || 0) - (prev?.sessions || 0);
    const deltaOrders = (current?.orders || 0) - (prev?.orders || 0);
    const deltaInsta = currentInsta - prevInsta;

    kpiEl.innerHTML = `
      <div class="kpi-card"><div class="kpi-label">Обраний місяць</div><div class="kpi-value">${labels[m]}</div><div class="kpi-sub neutral">порівняння з ${labels[c]}</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC виторг</div><div class="kpi-value">${formatNum(current?.revenueUah || 0)}</div><div class="kpi-sub neutral">дельта: ${formatNum(deltaRevenue)} (${formatDelta(current?.revenueUah, prev?.revenueUah)})</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC сесії</div><div class="kpi-value">${formatNum(current?.sessions || 0)}</div><div class="kpi-sub neutral">дельта: ${formatNum(deltaSessions)} (${formatDelta(current?.sessions, prev?.sessions)})</div></div>
      <div class="kpi-card"><div class="kpi-label">PPC замовлення</div><div class="kpi-value">${formatNum(current?.orders || 0)}</div><div class="kpi-sub neutral">дельта: ${formatNum(deltaOrders)} (${formatDelta(current?.orders, prev?.orders)})</div></div>
      <div class="kpi-card"><div class="kpi-label">Instagram перегляди</div><div class="kpi-value">${formatNum(currentInsta)}</div><div class="kpi-sub neutral">дельта: ${formatNum(deltaInsta)} (${formatDelta(currentInsta, prevInsta)})</div></div>
    `;

    rowsEl.innerHTML = `
      <tr><td>PPC сесії</td><td class="num">${formatNum(current?.sessions || 0)}</td><td class="num">${formatNum(prev?.sessions || 0)}</td><td class="num">${formatDelta(current?.sessions, prev?.sessions)}</td></tr>
      <tr><td>PPC замовлення</td><td class="num">${formatNum(current?.orders || 0)}</td><td class="num">${formatNum(prev?.orders || 0)}</td><td class="num">${formatDelta(current?.orders, prev?.orders)}</td></tr>
      <tr><td>PPC конверсія</td><td class="num">${formatPct(current?.convPct || 0)}</td><td class="num">${formatPct(prev?.convPct || 0)}</td><td class="num">${formatDelta(current?.convPct, prev?.convPct)}</td></tr>
      <tr><td>PPC виторг</td><td class="num">${formatNum(current?.revenueUah || 0)}</td><td class="num">${formatNum(prev?.revenueUah || 0)}</td><td class="num">${formatDelta(current?.revenueUah, prev?.revenueUah)}</td></tr>
      <tr><td>Instagram перегляди</td><td class="num">${formatNum(currentInsta)}</td><td class="num">${formatNum(prevInsta)}</td><td class="num">${formatDelta(currentInsta, prevInsta)}</td></tr>
    `;

    focusInsightsEl.innerHTML = `
      <div class="section-head" style="margin-top:16px;">
        <div>
          <div class="label">Короткий аналіз місяця</div>
          <h3 style="font-family: 'Unbounded'; font-size: 20px;">${labels[m] || m}</h3>
        </div>
        <div class="summary">Лаконічна аналітика по ключових метриках у форматі, схожому на початковий звіт.</div>
      </div>
      <div class="insight-chips">
        <span class="insight-chip">PPC: ${formatNum(current?.sessions || 0)} сесій</span>
        <span class="insight-chip">CR: ${formatPct(current?.convPct || 0)}</span>
        <span class="insight-chip">Виторг: ${formatNum(current?.revenueUah || 0)} грн</span>
        <span class="insight-chip">Instagram: ${formatNum(currentInsta)} переглядів</span>
      </div>
      <div class="focus-snippets">
        ${(focusInsight.snippets || []).slice(0,3).map((s)=>`<div class="focus-snippet"><div>${s.text}</div></div>`).join("") || "<div class=\"focus-snippet\">Аналіз по цьому місяцю формується з наявних метрик і буде доповнений при додаванні наступних місяців.</div>"}
      </div>
    `;
  }

  presetsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-preset]");
    if (!btn) return;
    const p = btn.dataset.preset;
    const idx = availableMonths.indexOf(mainSel.value);
    if (p === "prev") {
      compareSel.value = availableMonths[Math.max(0, idx - 1)];
    }
    if (p === "qoq") {
      compareSel.value = availableMonths[Math.max(0, idx - 3)];
    }
    render();
  });

  [mainSel, compareSel].forEach((s) => s.addEventListener("change", render));
  render();
}
