import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string; // e.g., 'note_created', 'user_added_to_workspace'
  actor: string; // user ID who performed the action
  workspaceId: string; // workspace ID
  target: string; // ID of the affected entity (note, user, etc.)
  targetType: string; // 'note', 'user', 'workspace'
  timestamp: Date;
  metadata: Record<string, any>; // additional data like old/new values
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  actor: { type: String, required: true },
  workspaceId: { type: String, required: true },
  target: { type: String, required: true },
  targetType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

// Ensure logs are immutable (no updates allowed)
AuditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable'));
  }
  next();
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
