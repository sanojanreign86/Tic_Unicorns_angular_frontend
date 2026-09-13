export interface AuditLog {
  auditLogId: number;
  userId: number;
  entityType: string;
  entityId: number;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}