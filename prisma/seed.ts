import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Wipe in dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.adminReview.deleteMany();
  await prisma.aIAssessment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.applicationDetails.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Demo@1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@portal.local",
      passwordHash: password,
      fullName: "Operator Anika Rao",
      role: "ADMIN",
    },
  });

  const citizen1 = await prisma.user.create({
    data: {
      email: "citizen1@portal.local",
      passwordHash: password,
      fullName: "Meera Iyer",
      role: "CITIZEN",
      phone: "+91 90000 00001",
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      email: "citizen2@portal.local",
      passwordHash: password,
      fullName: "Rohan Kumar",
      role: "CITIZEN",
      phone: "+91 90000 00002",
    },
  });

  // Application 1 — DRAFT
  const appDraft = await prisma.application.create({
    data: {
      referenceCode: "WAP-2025-0001",
      applicantId: citizen1.id,
      category: "Housing Subsidy",
      title: "Affordable housing subsidy — first application",
      status: "DRAFT",
      details: {
        create: {
          fullName: citizen1.fullName,
          dateOfBirth: new Date("1990-04-12"),
          nationalId: "XXXX-1234-5678",
          addressLine1: "12, MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          reason: "Seeking affordable housing subsidy for a family of four.",
          declaredIncome: 320000,
          householdSize: 4,
          prevApplications: 0,
        },
      },
    },
  });

  // Application 2 — SUBMITTED + AI assessment completed (manual review)
  const appReview = await prisma.application.create({
    data: {
      referenceCode: "WAP-2025-0002",
      applicantId: citizen1.id,
      category: "Education Grant",
      title: "Postgraduate education grant",
      status: "UNDER_REVIEW",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      details: {
        create: {
          fullName: citizen1.fullName,
          dateOfBirth: new Date("1990-04-12"),
          nationalId: "XXXX-1234-5678",
          addressLine1: "12, MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          reason: "Pursuing a Master's programme; requesting tuition assistance.",
          declaredIncome: 280000,
          householdSize: 4,
          prevApplications: 1,
        },
      },
      documents: {
        create: [
          {
            fileName: "id_proof.pdf",
            mimeType: "application/pdf",
            sizeBytes: 184523,
            storageKey: "demo/id_proof.pdf",
            category: "id_proof",
          },
          {
            fileName: "admission_letter.pdf",
            mimeType: "application/pdf",
            sizeBytes: 95124,
            storageKey: "demo/admission_letter.pdf",
            category: "supporting",
          },
        ],
      },
      aiAssessments: {
        create: {
          modelVersion: "mock-ai-v1.2.0",
          status: "COMPLETED",
          riskLevel: "MEDIUM",
          riskScore: 0.42,
          confidenceScore: 0.81,
          recommendation: "MANUAL_REVIEW",
          explanationSummary: [
            "Applicant income within eligible band.",
            "Supporting documents present but not yet verified.",
            "Prior application history shows 1 successful grant.",
          ],
          rawSignals: { incomeBand: "middle", docCount: 2, hasFlags: false },
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60),
        },
      },
    },
  });

  // Application 3 — APPROVED
  const appApproved = await prisma.application.create({
    data: {
      referenceCode: "WAP-2025-0003",
      applicantId: citizen2.id,
      category: "Pension Enrollment",
      title: "Senior citizen pension enrollment",
      status: "APPROVED",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      details: {
        create: {
          fullName: "Lalitha Kumar",
          dateOfBirth: new Date("1958-09-02"),
          nationalId: "XXXX-7777-8888",
          addressLine1: "45, Jayanagar",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560011",
          reason: "Enrolling under the senior citizen pension scheme.",
          declaredIncome: 0,
          householdSize: 1,
          prevApplications: 0,
        },
      },
      aiAssessments: {
        create: {
          modelVersion: "mock-ai-v1.2.0",
          status: "COMPLETED",
          riskLevel: "LOW",
          riskScore: 0.12,
          confidenceScore: 0.94,
          recommendation: "APPROVE",
          explanationSummary: [
            "Age eligibility confirmed.",
            "Income within scheme threshold.",
            "Identity document verified.",
          ],
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 60),
        },
      },
    },
  });

  // Application 4 — REJECTED
  const appRejected = await prisma.application.create({
    data: {
      referenceCode: "WAP-2025-0004",
      applicantId: citizen2.id,
      category: "Business Permit",
      title: "Small business operating permit",
      status: "REJECTED",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      details: {
        create: {
          fullName: citizen2.fullName,
          dateOfBirth: new Date("1985-01-22"),
          nationalId: "XXXX-9999-0000",
          addressLine1: "9, Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560038",
          reason: "Operating permit for a neighborhood café.",
          declaredIncome: 650000,
          householdSize: 3,
          prevApplications: 2,
        },
      },
      aiAssessments: {
        create: {
          modelVersion: "mock-ai-v1.2.0",
          status: "COMPLETED",
          riskLevel: "HIGH",
          riskScore: 0.78,
          confidenceScore: 0.72,
          recommendation: "REQUEST_CORRECTION",
          explanationSummary: [
            "Address proof missing.",
            "Declared income inconsistent with prior filings.",
            "Two prior applications were withdrawn.",
          ],
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60),
        },
      },
    },
  });

  // Approve review for app 3
  await prisma.adminReview.create({
    data: {
      applicationId: appApproved.id,
      reviewerId: admin.id,
      decision: "APPROVE",
      notes: "All eligibility criteria met. Approving.",
    },
  });

  // Reject review for app 4 (override AI's REQUEST_CORRECTION)
  await prisma.adminReview.create({
    data: {
      applicationId: appRejected.id,
      reviewerId: admin.id,
      decision: "REJECT",
      notes: "Insufficient evidence; previous patterns indicate ineligibility.",
      overrodeAI: true,
      overrideReason:
        "AI recommended REQUEST_CORRECTION but applicant history and missing documents justify outright rejection.",
    },
  });

  // Audit logs
  const baseLogs = [
    {
      applicationId: appDraft.id,
      actorId: citizen1.id,
      actorRole: "CITIZEN" as const,
      action: "APPLICATION_CREATED" as const,
      newStatus: "DRAFT" as const,
    },
    {
      applicationId: appReview.id,
      actorId: citizen1.id,
      actorRole: "CITIZEN" as const,
      action: "APPLICATION_CREATED" as const,
      newStatus: "DRAFT" as const,
    },
    {
      applicationId: appReview.id,
      actorId: citizen1.id,
      actorRole: "CITIZEN" as const,
      action: "APPLICATION_SUBMITTED" as const,
      oldStatus: "DRAFT" as const,
      newStatus: "SUBMITTED" as const,
    },
    {
      applicationId: appReview.id,
      actorId: citizen1.id,
      actorRole: "CITIZEN" as const,
      action: "AI_CHECK_TRIGGERED" as const,
      oldStatus: "SUBMITTED" as const,
      newStatus: "AI_REVIEW" as const,
    },
    {
      applicationId: appReview.id,
      action: "AI_CHECK_COMPLETED" as const,
      oldStatus: "AI_REVIEW" as const,
      newStatus: "UNDER_REVIEW" as const,
      metadata: { recommendation: "MANUAL_REVIEW", riskLevel: "MEDIUM" },
    },
    {
      applicationId: appApproved.id,
      actorId: admin.id,
      actorRole: "ADMIN" as const,
      action: "ADMIN_REVIEWED" as const,
      oldStatus: "UNDER_REVIEW" as const,
      newStatus: "APPROVED" as const,
      metadata: { decision: "APPROVE" },
    },
    {
      applicationId: appRejected.id,
      actorId: admin.id,
      actorRole: "ADMIN" as const,
      action: "AI_OVERRIDE_USED" as const,
      metadata: {
        aiRecommendation: "REQUEST_CORRECTION",
        adminDecision: "REJECT",
      },
    },
    {
      applicationId: appRejected.id,
      actorId: admin.id,
      actorRole: "ADMIN" as const,
      action: "STATUS_CHANGED" as const,
      oldStatus: "UNDER_REVIEW" as const,
      newStatus: "REJECTED" as const,
    },
  ];
  for (const log of baseLogs) await prisma.auditLog.create({ data: log });

  await prisma.notification.createMany({
    data: [
      {
        userId: citizen1.id,
        applicationId: appReview.id,
        title: "Application under review",
        body: "Your application WAP-2025-0002 is being reviewed by an operator.",
      },
      {
        userId: citizen2.id,
        applicationId: appApproved.id,
        title: "Application approved",
        body: "Your application WAP-2025-0003 has been approved.",
      },
    ],
  });

  console.log("Seed complete. Demo credentials:");
  console.log("  Admin:    admin@portal.local / Demo@1234");
  console.log("  Citizen1: citizen1@portal.local / Demo@1234");
  console.log("  Citizen2: citizen2@portal.local / Demo@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
