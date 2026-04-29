function num(value) {
  return new Intl.NumberFormat("uk-UA").format(value);
}

function pct(value) {
  return `${value.toString().replace(".", ",")}%`;
}

export function renderDecemberPpcTable(reportData) {
  const holder = document.getElementById("december-ppc-table");
  if (!holder) return;

  const rows = reportData?.historical?.ppcByMonth || [];
  const december = rows.find((row) => row.period === "2025-12");
  if (!december) {
    holder.innerHTML = "<p>Дані за грудень 2025 не знайдені у джерелі.</p>";
    return;
  }

  holder.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Період</th>
            <th class="num">Сесії</th>
            <th class="num">Частка трафіку</th>
            <th class="num">Замовлення</th>
            <th class="num">Конверсія</th>
            <th class="num">Виторг (грн)</th>
            <th class="num">Сер. чек</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Грудень 2025</td>
            <td class="num">${num(december.sessions)}</td>
            <td class="num">${pct(december.sharePct)}</td>
            <td class="num">${num(december.orders)}</td>
            <td class="num">${pct(december.convPct)}</td>
            <td class="num">${num(december.revenueUah)}</td>
            <td class="num">${num(december.avgCheckUah)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
