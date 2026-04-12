import mongoose,{Schema,Document} from "mongoose";

export interface IReviewState extends Document{
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nextReviewDate: Date;
  lastReviewDate: Date;
  recallCount: number;
  recallStrength: number;
  interval: number;
  easeFactor: number;
  reviewHistory:{
    reviewedAt: Date;
    result: 'easy' | 'good' | 'hard' | 'forgot';
    strength: number;
  }[];
  reminderSentAt:Date | null;
  isCompleted: boolean;
}

const ReviewStateSchema = new Schema<IReviewState>({
  contentId: {
    type: Schema.Types.ObjectId,
    ref: 'ContentItem',
    required: true,
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nextReviewDate:{
    type: Date,
    default: ()=>new Date(Date.now()+86400000),
  },
  lastReviewDate:{
    type: Date,
    default:null,
  },
  recallCount:{
    type:Number,
    default:0,
    
  },
   recallStrength: { 
    type: Number, 
    default: 0.5
   },
   interval:{
    type:Number,
    default:1,
   },

     easeFactor: { 
      type: Number, 
      default: 2.5 
    },
  reviewHistory: [
    {
      reviewedAt: Date,
      result: { 
        type: String, 
        enum: ['easy', 'good', 'hard', 'forgot'] 
      },
      strength: Number,
    },
  ],
  reminderSentAt: { type: Date, default: null },
  isCompleted: {
      type: Boolean,
      default: false 
    },
});

ReviewStateSchema.index({
  userId: 1,
  nextReviewDate: 1,
})

export default mongoose.models.ReviewState ||
  mongoose.model<IReviewState>('ReviewState', ReviewStateSchema);