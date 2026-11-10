const paymentContent = document.querySelector("#pix-payment-content");
const paymentError = document.querySelector("#pix-payment-error");
const paymentAmount = document.querySelector("#pix-payment-amount");
const frequencyNote = document.querySelector("#pix-frequency-note");
const qrImage = document.querySelector("#pix-qr-image");
const expirationNote = document.querySelector("#pix-expiration");
const copyCode = document.querySelector("#pix-copy-code");
const copyStatus = document.querySelector("#pix-copy-status");

function showPaymentError() {
  paymentError.hidden = false;
}

function loadPixPayment() {
  const savedPayment = sessionStorage.getItem("calmae-pix-payment");
  if (!savedPayment) {
    showPaymentError();
    return;
  }

  let payment;
  try {
    payment = JSON.parse(savedPayment);
  } catch {
    sessionStorage.removeItem("calmae-pix-payment");
    showPaymentError();
    return;
  }

  const { amount, frequency, pix } = payment;
  if (!Number.isFinite(amount)
    || amount <= 0
    || !["once", "monthly"].includes(frequency)
    || typeof pix?.encodedImage !== "string"
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(pix.encodedImage)
    || typeof pix.payload !== "string"
    || !pix.payload) {
    sessionStorage.removeItem("calmae-pix-payment");
    showPaymentError();
    return;
  }

  paymentAmount.textContent = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
  frequencyNote.textContent = frequency === "monthly"
    ? "Esta é a primeira cobrança da sua contribuição mensal. As próximas cobranças serão geradas pelo Asaas."
    : "Doação única";
  qrImage.src = `data:image/png;base64,${pix.encodedImage}`;
  copyCode.value = pix.payload;

  const expiration = typeof pix.expirationDate === "string" ? new Date(pix.expirationDate) : null;
  expirationNote.textContent = !expiration || Number.isNaN(expiration.getTime())
    ? ""
    : `Válido até ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(expiration)}.`;

  paymentContent.hidden = false;
}

document.querySelector("#pix-copy-button").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyCode.value);
    copyStatus.textContent = "Código Pix copiado.";
  } catch {
    copyStatus.textContent = "Não foi possível copiar automaticamente. Selecione e copie o código acima.";
    copyCode.focus();
    copyCode.select();
  }
});

loadPixPayment();
