import { z } from "zod";

const digitsOnly = (value) => value.replace(/\D/g, "");

export const donationSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.number().finite().positive().max(1_500_000),
  frequency: z.enum(["once", "monthly"]),
  paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{0,31}$/).optional(),
  cpfCnpj: z.string().transform(digitsOnly).refine(
    (value) => value.length === 11 || value.length === 14,
    "Informe CPF com 11 dígitos ou CNPJ com 14 dígitos.",
  ),
  phone: z.string().transform(digitsOnly).refine(
    (value) => value.length === 10 || value.length === 11,
    "Informe o DDD e o telefone com 10 ou 11 números, sem o código do país (+55).",
  ),
}).superRefine((donation, context) => {
  if (donation.frequency === "monthly" && donation.paymentMethod === "CREDIT_CARD") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["paymentMethod"],
      message: "Para doações mensais, selecione Pix ou boleto. A cobrança automática mensal no cartão ainda não está habilitada.",
    });
  }
});
