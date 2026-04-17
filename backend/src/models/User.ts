import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

// ─── Types ────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

// ─── Interfaces ───────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// ─── Schema ───────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Hooks ────────────────────────────────────────────────────

// Hash password only when modified
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(
    this.password,
    config.bcrypt.saltRounds
  );

  next();
});

// Remove password from JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.password;
    return ret;
  },
});

// ─── Instance Methods ─────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── Static Methods ───────────────────────────────────────────

UserSchema.statics.findByEmail = function (
  email: string
): Promise<IUser | null> {
  return this.findOne({ email }).select('+password');
};

// ─── Model ────────────────────────────────────────────────────

export const User = model<IUser, IUserModel>('User', UserSchema);