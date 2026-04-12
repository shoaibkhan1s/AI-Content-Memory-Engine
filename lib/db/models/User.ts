import mongoose,{Schema,Document} from "mongoose";

export interface IUser extends Document{
  name: string,
  email: string
  passwordHash: string,
  createdAt: Date;
  preferences:{
    defaultCategory: string;
    reminderTime: string;
    timezone: string;
    emailReminders: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    frequency: 'daily' | 'every 2 Days' | 'weekly';
    lastReminderSentAt: Date | null;
  }
}

const UserSchema = new Schema<IUser>({
  name:{
    type: String,
    required: true,
    trim: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  },
  preferences:{
    defaultCategory:{
      type:String,
      default: 'General',
    },
    reminderTime:{
      type: String,
      default: '09:00',
    },
    timezone:{
      type: String,
      default:'Asia/Kolkata',
    },
    emailReminders:{
      type: Boolean,
      default: true,
    }
  },
  reminderSettings:{
    enabled:{
      type: Boolean,
      default: true,
    },
    frequency:{
      type: String,
      enum: ['daily','every 2 days','weekly'],
      default: "daily",
    },
    lastReminderSentAt:{
      type: Date,
      default: null
    },
  }
})

export default mongoose.models.User || mongoose.model<IUser>('User',UserSchema)