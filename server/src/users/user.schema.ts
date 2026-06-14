import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type UserRole = 'user' | 'landlord' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'deleted'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId

  @Prop({ required: true, unique: true, index: true })
  firebaseUid: string

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string

  @Prop({ trim: true })
  displayName?: string

  @Prop({ trim: true })
  name?: string

  @Prop({ trim: true })
  phone?: string

  @Prop({ trim: true })
  avatarUrl?: string

  @Prop({ type: [String], default: ['user'], index: true })
  roles: UserRole[]

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop({ default: 'active', enum: ['active', 'suspended', 'deleted'], index: true })
  status: UserStatus

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
