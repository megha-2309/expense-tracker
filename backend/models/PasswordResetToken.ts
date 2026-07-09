import mongoose, { Document, Model } from 'mongoose';


export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;  
  token: string;                    
  expiresAt: Date;                   
  createdAt: Date;
}

const passwordResetTokenSchema = new mongoose.Schema<IPasswordResetToken>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

passwordResetTokenSchema.index({ userId: 1 });

passwordResetTokenSchema.index({ token: 1 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);