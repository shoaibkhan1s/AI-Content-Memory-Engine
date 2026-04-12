import mongoose, { Schema, Document } from "mongoose";

export interface IRelatedContent extends Document {
  contentId: mongoose.Types.ObjectId;
  relatedContentIds: mongoose.Types.ObjectId[];
  similarityScores: number[];
  updatedAt: Date;
}

const RelatedContentSchema = new Schema<IRelatedContent>({
  contentId: {
    type: Schema.Types.ObjectId,
    ref: "ContentItem",
    required: true,
    unique: true,
  },
  relatedContentIds: [{ type: Schema.Types.ObjectId, ref: "ContentItem" }],
  similarityScores: [Number],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.RelatedContent ||
  mongoose.model<IRelatedContent>("RelatedContent", RelatedContentSchema);
