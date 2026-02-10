import AuditLog from '../models/AuditLog';

export class AuditService {
  static async logEvent(
    action: string,
    actor: string,
    workspaceId: string,
    target: string,
    targetType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const log = new AuditLog({
        action,
        actor,
        workspaceId,
        target,
        targetType,
        metadata,
      });
      await log.save();
      console.log(`📝 Audit log: ${action} by ${actor} in workspace ${workspaceId}`);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  static async getLogsForWorkspace(
    workspaceId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<any[]> {
    try {
      const logs = await AuditLog.find({ workspaceId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .populate('actor', 'name email'); // Populate actor details
      return logs;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}
