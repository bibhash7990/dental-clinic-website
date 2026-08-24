import { prisma } from "@/lib/prisma";

export async function logAudit(
  userEmail: string,
  action: string,
  entity: string,
  entityId: string,
  detail?: string
) {
  try {
    await prisma.auditLog.create({
      data: { userEmail, action, entity, entityId, detail: detail ?? null },
    });
  } catch (err) {
    console.error("[audit] write failed", err);
  }
}
