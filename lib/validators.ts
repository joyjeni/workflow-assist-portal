import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one digit"),
  phone: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const applicationStep1Schema = z.object({
  category: z.string().min(1, "Select an application category"),
  title: z.string().min(4, "Add a short title"),
});

export const applicationStep2Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  nationalId: z.string().min(6, "National ID is too short"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

export const applicationStep3Schema = z.object({
  reason: z
    .string()
    .min(30, "Provide at least 30 characters of context")
    .max(2000, "Keep under 2000 characters"),
  declaredIncome: z
    .union([z.coerce.number().int().min(0), z.literal("").transform(() => undefined)])
    .optional(),
  householdSize: z
    .union([z.coerce.number().int().min(1).max(40), z.literal("").transform(() => undefined)])
    .optional(),
  prevApplications: z
    .union([z.coerce.number().int().min(0).max(50), z.literal("").transform(() => undefined)])
    .optional(),
});

export const fullApplicationSchema = applicationStep1Schema
  .merge(applicationStep2Schema)
  .merge(applicationStep3Schema);
export type ApplicationInput = z.infer<typeof fullApplicationSchema>;

export const documentMetaSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().min(0).max(20 * 1024 * 1024),
  category: z.enum(["id_proof", "address_proof", "supporting"]),
});
export type DocumentMetaInput = z.infer<typeof documentMetaSchema>;

export const reviewDecisionSchema = z
  .object({
    decision: z.enum([
      "APPROVE",
      "REJECT",
      "REQUEST_CORRECTION",
      "ESCALATE",
    ]),
    notes: z.string().max(2000).optional(),
    overrodeAI: z.boolean().optional().default(false),
    overrideReason: z.string().max(2000).optional(),
  })
  .refine(
    (d) => !d.overrodeAI || (d.overrideReason && d.overrideReason.trim().length >= 10),
    {
      path: ["overrideReason"],
      message: "Override reason is required (10+ chars) when overriding AI.",
    }
  );
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

export const applicationCategories = [
  "Housing Subsidy",
  "Education Grant",
  "Pension Enrollment",
  "Business Permit",
  "Healthcare Assistance",
  "Document Reissue",
] as const;
