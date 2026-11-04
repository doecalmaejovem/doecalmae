const form = document.querySelector("#dashboard-login");
const passwordInput = document.querySelector("#dashboard-password");
const statusMessage = document.querySelector("#dashboard-status");
const reportContainer = document.querySelector("#dashboard-report");
const apiBaseUrl = document.querySelector('meta[name="calmae-api-base-url"]').content.trim();
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function basicAuthorization(password) {
  const bytes = new TextEncoder().encode(`admin:${password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

function makeCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function renderReport(rows) {
  const table = document.createElement("table");
  table.className = "report-table";
  const headers = [
    "Código",
    "Doações",
    "Pagamentos confirmados",
    "Valor confirmado",
    "Pendentes / valor",
    "Vencidos / valor",
    "Estornos",
    "Valor estornado",
    "Valor líquido",
    "Em análise",
  ];
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const header of headers) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = header;
    headerRow.append(cell);
  }
  head.append(headerRow);
  table.append(head);

  const body = document.createElement("tbody");
  for (const row of rows) {
    const tableRow = document.createElement("tr");
    tableRow.append(
      makeCell(row.code),
      makeCell(String(row.donations_count)),
      makeCell(String(row.paid_payments_count)),
      makeCell(currency.format(Number(row.paid_amount))),
      makeCell(`${row.pending_payments_count} · ${currency.format(Number(row.pending_amount))}`),
      makeCell(`${row.overdue_payments_count} · ${currency.format(Number(row.overdue_amount))}`),
      makeCell(String(row.refunded_payments_count)),
      makeCell(currency.format(Number(row.refunded_amount))),
      makeCell(currency.format(Number(row.net_amount))),
      makeCell(String(row.under_review_payments_count)),
    );
    if (row.is_active === false) tableRow.classList.add("inactive-code");
    body.append(tableRow);
  }
  table.append(body);
  reportContainer.replaceChildren(table);

  const unknownRefunds = rows.reduce((total, row) => total + row.unknown_partial_refunds_count, 0);
  if (unknownRefunds) {
    const note = document.createElement("p");
    note.className = "dashboard-note";
    note.textContent = `${unknownRefunds} estorno(s) parcial(is) sem valor detalhado no evento do Asaas; não foi possível incluí-los no total estornado.`;
    reportContainer.append(note);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  reportContainer.replaceChildren();
  statusMessage.textContent = "Carregando relatório...";

  try {
    const response = await fetch(new URL("/api/admin/referral-report", apiBaseUrl), {
      headers: { Authorization: basicAuthorization(passwordInput.value) },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) passwordInput.select();
      throw new Error(result.error || "Não foi possível carregar o relatório.");
    }

    renderReport(result.rows);
    statusMessage.textContent = `Relatório atualizado em ${new Date().toLocaleString("pt-BR")}.`;
  } catch (error) {
    statusMessage.textContent = error.message || "Não foi possível conectar à API.";
  }
});
