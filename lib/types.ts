// Re-export commonly used types and enums from Prisma so the rest of the app
// doesn't import directly from "@prisma/client" everywhere.
export type {
  User,
  Application,
  ApplicationDetails,
  Document,
  AIAssessment,
  AdminReview,
  AuditLog,
  Notification,
} from "@prisma/client";

export type ApplicationWithRelations = {
  id: string;
  referenceCode: string;
  applicantId: string;
  category: string;
  title: string;
  status: import("@prisma/client").ApplicationStatus;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  details?: import("@prisma/client").ApplicationDetails | null;
  documents?: import("@prisma/client").Document[];
  aiAssessments?: import("@prisma/client").AIAssessment[];
  reviews?: import("@prisma/client").AdminReview[];
  auditLogs?: import("@prisma/client").AuditLog[];
  applicant?: { id: string; fullName: string; email: string };
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  AI_REVIEW: "AI Review",
  UNDER_REVIEW: "Under Review",
  CORRECTION_REQUESTED: "Correction Requested",
  ESCALATED: "Escalated",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};
