import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type UserRole = 'user' | 'landlord' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'deleted'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId

  @Prop({ type: String, required: true, unique: true, index: true })
  firebaseUid: string

  @Prop({ type: String, required: true, lowercase: true, trim: true, index: true })
  email: string

  @Prop({ type: String, trim: true })
  displayName?: string

  @Prop({ type: String, trim: true })
  name?: string

  @Prop({ type: String, trim: true })
  phone?: string

  @Prop({ type: String, trim: true })
  avatarUrl?: string

  @Prop({ type: [String], enum: ['user', 'landlord', 'admin'], default: ['user'], index: true })
  roles: UserRole[]

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean

  @Prop({ type: String, default: 'active', enum: ['active', 'suspended', 'deleted'], index: true })
  status: UserStatus

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
