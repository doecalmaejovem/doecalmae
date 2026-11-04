export function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function hasValidCpf(digits) {
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (slice, weight) => {
    const sum = [...slice].reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
    const remainder = (sum * 10) % 11;
    return String(remainder === 10 ? 0 : remainder);
  };

  return checkDigit(digits.slice(0, 9), 10) === digits[9]
    && checkDigit(digits.slice(0, 10), 11) === digits[10];
}

function hasValidCnpj(digits) {
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const checkDigit = (slice, weights) => {
    const sum = [...slice].reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return String(remainder < 2 ? 0 : 11 - remainder);
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, ...firstWeights];
  return checkDigit(digits.slice(0, 12), firstWeights) === digits[12]
    && checkDigit(digits.slice(0, 13), secondWeights) === digits[13];
}

export function validateDonationFields({ name, email, cpfCnpj, phone, amount, frequency, paymentMethod }) {
  const errors = {};
  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const document = digitsOnly(cpfCnpj);
  const phoneDigits = digitsOnly(phone);

  if (normalizedName.length < 2 || normalizedName.length > 120) {
    errors.name = "Informe seu nome completo (de 2 a 120 caracteres).";
  }
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!((document.length === 11 && hasValidCpf(document))
    || (document.length === 14 && hasValidCnpj(document)))) {
    errors.cpfCnpj = "Confira o CPF ou CNPJ. Digite somente os números de um documento válido.";
  }
  if (!/^\d{10,11}$/.test(phoneDigits)) {
    errors.phone = "Informe o DDD e o telefone com 10 ou 11 números, sem o código do país (+55).";
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_500_000
    || Math.abs(amount * 100 - Math.round(amount * 100)) > Number.EPSILON * 100) {
    errors.amount = "Informe um valor entre R$ 0,01 e R$ 1.500.000,00, com até duas casas decimais.";
  }
  if (!["once", "monthly"].includes(frequency)) {
    errors.frequency = "Selecione a frequência da doação.";
  }
  if (!["PIX", "BOLETO", "CREDIT_CARD"].includes(paymentMethod)) {
    errors.paymentMethod = "Selecione uma forma de pagamento.";
  } else if (frequency === "monthly" && paymentMethod === "CREDIT_CARD") {
    errors.paymentMethod = "Para doações mensais, selecione Pix ou boleto.";
  }

  return errors;
}
