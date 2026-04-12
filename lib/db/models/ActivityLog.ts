import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  actionType:
    | "save"
    | "view"
    | "review"
    | "edit"
    | "delete"
    | "search"
    | "archive"
    | "pin";
  contentId?: mongoose.Types.ObjectId;
  timestamp: Date;
  metadata: Record<string, any>;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  actionType: {
    type: String,
    enum: [
      "save",
      "view",
      "review",
      "edit",
      "delete",
      "search",
      "archive",
      "pin",
    ],
    required: true,
  },
  contentId: { type: Schema.Types.ObjectId, ref: "ContentItem" },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
