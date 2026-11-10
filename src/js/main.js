import { digitsOnly, validateDonationFields } from "./donation-form-validation.js";

const campaignConfig = {
  partnerEmail: "",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const paymentStatus = document.querySelector("#payment-status");
const donationStatus = document.querySelector("#donation-status");
const pixReturn = document.querySelector("#pix-return");
const pixReturnMessage = document.querySelector("#pix-return-message");
const partnerStatus = document.querySelector("#partner-status");
const customAmountInput = document.querySelector("#custom-amount");
const donationForm = document.querySelector("#donation-form");
const donationSubmit = document.querySelector("#donation-submit");
const paymentMethodNote = document.querySelector("#payment-method-note");
const donorInputs = {
  name: donationForm.elements.name,
  email: donationForm.elements.email,
  cpfCnpj: donationForm.elements.cpfCnpj,
  phone: donationForm.elements.phone,
  amount: customAmountInput,
};
const touchedDonorInputs = new WeakSet();
const apiBaseUrl = document.querySelector('meta[name="calmae-api-base-url"]').content.trim()
  || (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:3000" : "");
let selectedAmount = 50;
let selectedPartnerAmount = null;
const savedDonationRequestId = sessionStorage.getItem("calmae-donation-request-id");
let donationRequestId = savedDonationRequestId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedDonationRequestId)
  ? savedDonationRequestId
  : crypto.randomUUID();
sessionStorage.setItem("calmae-donation-request-id", donationRequestId);

const savedPixReturn = sessionStorage.getItem("calmae-pix-return");
if (savedPixReturn) {
  try {
    const pixReturnInfo = JSON.parse(savedPixReturn);
    if (Number.isFinite(pixReturnInfo.amount) && pixReturnInfo.amount > 0) {
      pixReturnMessage.textContent =
        `A cobrança Pix de ${currency.format(pixReturnInfo.amount)} foi gerada e ainda aguarda pagamento. Se você já pagou, aguarde a confirmação do banco.`;
      pixReturn.hidden = false;
      pixReturn.scrollIntoView({ block: "start" });
    } else {
      sessionStorage.removeItem("calmae-pix-return");
    }
  } catch {
    sessionStorage.removeItem("calmae-pix-return");
  }
}

function dismissPixReturn() {
  pixReturn.hidden = true;
  sessionStorage.removeItem("calmae-pix-return");
}

document.querySelector("#pix-return-donate").addEventListener("click", () => {
  dismissPixReturn();
  document.querySelector("#pessoas").scrollIntoView({ behavior: "smooth" });
  donationSubmit.focus({ preventScroll: true });
});

document.querySelector("#pix-return-dismiss").addEventListener("click", dismissPixReturn);

function setSelectedAmount(amount) {
  selectedAmount = amount;
  customAmountInput.value = "";

  document.querySelectorAll(".donation-choice").forEach((button) => {
    const isSelected = Number(button.dataset.amount) === amount;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  updateDonationValidation();
}

function updatePaymentOptions() {
  const frequency = donationForm.elements.frequency.value;
  const cardOption = donationForm.querySelector('input[name="payment-method"][value="CREDIT_CARD"]');
  const cardLabel = cardOption.closest("label");

  cardOption.disabled = frequency === "monthly";
  cardLabel.hidden = cardOption.disabled;

  if (cardOption.disabled && cardOption.checked) {
    donationForm.querySelector('input[name="payment-method"][value="PIX"]').checked = true;
  }

  paymentMethodNote.textContent = frequency === "monthly"
    ? "O Asaas enviará uma cobrança Pix ou boleto a cada mês. Cada cobrança precisa ser paga; não há débito automático. Cartão mensal ainda não está habilitado."
    : "O pagamento será concluído no ambiente seguro do Asaas.";
}

function getDonationValues() {
  const formData = new FormData(donationForm);
  const customAmount = customAmountInput.value;
  return {
    amount: customAmount ? Number(customAmount) : selectedAmount,
    frequency: formData.get("frequency"),
    paymentMethod: formData.get("payment-method"),
    name: donorInputs.name.value,
    email: donorInputs.email.value,
    cpfCnpj: donorInputs.cpfCnpj.value,
    phone: donorInputs.phone.value,
  };
}

function updateDonationValidation() {
  const errors = validateDonationFields(getDonationValues());
  for (const [field, input] of Object.entries(donorInputs)) {
    input.setCustomValidity(errors[field] || "");
    if (errors[field] && touchedDonorInputs.has(input)) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }
  return errors;
}

for (const input of Object.values(donorInputs)) {
  input.addEventListener("input", () => {
    touchedDonorInputs.add(input);
    if (input === donorInputs.cpfCnpj || input === donorInputs.phone) {
      const cursor = input.selectionStart;
      const sanitized = digitsOnly(input.value);
      if (sanitized !== input.value) {
        input.value = sanitized;
        input.setSelectionRange(Math.min(cursor, sanitized.length), Math.min(cursor, sanitized.length));
      }
    }
    updateDonationValidation();
  });
  input.addEventListener("blur", () => {
    touchedDonorInputs.add(input);
    if (input === donorInputs.name || input === donorInputs.email) {
      input.value = input.value.trim();
    }
    updateDonationValidation();
  });
}

document.querySelectorAll(".donation-choice").forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedAmount(Number(button.dataset.amount));
    donationStatus.textContent = `${currency.format(selectedAmount)} selecionados.`;
  });
});

document.querySelectorAll(".amount-button").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.amount);
    setSelectedAmount(amount);
    paymentStatus.textContent = `${currency.format(amount)} selecionados para apoiar a campanha.`;
    document.querySelector("#pessoas").scrollIntoView({ behavior: "smooth" });
    donationStatus.textContent = `${currency.format(amount)} selecionados.`;
  });
});

document.querySelectorAll(".partner-tier").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPartnerAmount = Number(button.dataset.amount);
    partnerStatus.textContent =
      `Cota de ${currency.format(selectedPartnerAmount)} selecionada para financiar ${Math.round(selectedPartnerAmount / 1500)} jovens.`;
  });
});

customAmountInput.addEventListener("input", () => {
  document.querySelectorAll(".donation-choice").forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
  donationStatus.textContent = "";
  updateDonationValidation();
});

donationForm.addEventListener("change", (event) => {
  if (event.target.name === "frequency") {
    updatePaymentOptions();
  }
  updateDonationValidation();
});

donationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!apiBaseUrl) {
    donationStatus.textContent = "O pagamento ainda não está configurado neste site.";
    return;
  }

  for (const input of Object.values(donorInputs)) {
    touchedDonorInputs.add(input);
  }
  updateDonationValidation();
  if (!donationForm.reportValidity()) {
    donationStatus.textContent = "Confira os campos destacados antes de continuar.";
    return;
  }

  const formData = new FormData(donationForm);
  const values = getDonationValues();
  const payload = {
    amount: values.amount,
    frequency: formData.get("frequency"),
    paymentMethod: formData.get("payment-method"),
    name: values.name.trim(),
    email: values.email.trim(),
    cpfCnpj: digitsOnly(values.cpfCnpj),
    phone: digitsOnly(values.phone),
    requestId: donationRequestId,
  };

  donationSubmit.disabled = true;
  donationStatus.textContent = "Preparando o pagamento seguro...";

  try {
    let response;
    try {
      response = await fetch(new URL("/api/donations", apiBaseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Não foi possível conectar ao serviço de doações. Tente novamente mais tarde.");
    }
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Não foi possível iniciar o pagamento.");
    }

    if (payload.paymentMethod === "PIX") {
      if (!result.pix
        || typeof result.pix.encodedImage !== "string"
        || !/^[A-Za-z0-9+/]+={0,2}$/.test(result.pix.encodedImage)
        || typeof result.pix.payload !== "string"
        || !result.pix.payload) {
        throw new Error("A cobrança foi criada, mas o QR Code Pix não foi retornado. Tente novamente sem alterar os dados para recuperar esta cobrança.");
      }
      const pixPaymentData = {
        amount: values.amount,
        frequency: payload.frequency,
        pix: result.pix,
      };
      sessionStorage.setItem("calmae-pix-payment", JSON.stringify(pixPaymentData));
      sessionStorage.setItem("calmae-pix-return", JSON.stringify({ amount: values.amount }));
      donationRequestId = crypto.randomUUID();
      sessionStorage.setItem("calmae-donation-request-id", donationRequestId);
      window.location.assign(new URL("pix-payment.html", window.location.href).href);
      return;
    }

    const checkoutUrl = new URL(result.checkoutUrl);
    if (checkoutUrl.protocol !== "https:"
      || !["sandbox.asaas.com", "www.asaas.com"].includes(checkoutUrl.hostname)
      || checkoutUrl.username
      || checkoutUrl.password) {
      throw new Error("O Asaas retornou um endereço de pagamento inválido.");
    }

    donationRequestId = crypto.randomUUID();
    sessionStorage.setItem("calmae-donation-request-id", donationRequestId);
    window.location.assign(checkoutUrl.href);
  } catch (error) {
    donationStatus.textContent = error.message || "Não foi possível iniciar o pagamento. Tente novamente.";
    donationSubmit.disabled = false;
  }
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  donationSubmit.disabled = false;
  if (donationStatus.textContent === "Preparando o pagamento seguro...") {
    donationStatus.textContent = "";
  }
  updatePaymentOptions();
  updateDonationValidation();
});

updatePaymentOptions();
updateDonationValidation();

document.querySelector("#partner-contact").addEventListener("click", () => {
  if (!campaignConfig.partnerEmail) {
    partnerStatus.textContent = selectedPartnerAmount
      ? `Cota de ${currency.format(selectedPartnerAmount)} para ${Math.round(selectedPartnerAmount / 1500)} jovens selecionada. O contato para parcerias será divulgado em breve.`
      : "O contato para parcerias será divulgado em breve. Selecione uma cota para conhecer o impacto da sua empresa.";
    return;
  }

  const subject = encodeURIComponent("Parceria empresarial — Calmaê Jovem");
  const body = selectedPartnerAmount
    ? encodeURIComponent(`Tenho interesse na cota de ${currency.format(selectedPartnerAmount)} para apoiar o Calmaê Jovem.`)
    : "";
  window.location.href = `mailto:${campaignConfig.partnerEmail}?subject=${subject}${body ? `&body=${body}` : ""}`;
});

const videoFrame = document.querySelector(".video-frame");
const videoUrl = videoFrame.dataset.videoUrl.trim();

if (videoUrl) {
  const parsedUrl = new URL(videoUrl);
  let embedUrl;

  if (["www.youtube.com", "youtube.com", "youtu.be"].includes(parsedUrl.hostname)) {
    const videoId =
      parsedUrl.hostname === "youtu.be"
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get("v");

    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    }
  } else if (["vimeo.com", "www.vimeo.com"].includes(parsedUrl.hostname)) {
    const videoId = parsedUrl.pathname.split("/").filter(Boolean).pop();

    if (videoId && /^\d+$/.test(videoId)) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  if (embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Depoimentos do Calmaê Jovem";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    videoFrame.replaceChildren(iframe);
  } else {
    console.error("A URL de vídeo deve ser um link válido do YouTube ou Vimeo.");
  }
}
