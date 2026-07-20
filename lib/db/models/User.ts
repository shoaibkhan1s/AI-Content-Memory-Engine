import mongoose,{Schema,Document} from "mongoose";

export interface IUser extends Document{
  name: string,
  email: string
  passwordHash: string,
  createdAt: Date;
  emailVerified: boolean;
  emailVerificationTokenHash: string | null;
  emailVerificationExpiresAt: Date | null;

  resetPasswordTokenHash: string | null;
  resetPasswordExpiresAt: Date | null;
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
  emailVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  emailVerificationTokenHash: {
    type: String,
    default: null,
  },
  emailVerificationExpiresAt: {
    type: Date,
    default: null,
  },

  resetPasswordTokenHash: {
    type: String,
    default: null,
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null,
  },
})

export default mongoose.models.User || mongoose.model<IUser>('User',UserSchema)