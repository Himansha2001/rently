import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type MessageDocument = HydratedDocument<Message>

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId

  @Prop({ required: true, trim: true, maxlength: 4000 })
  body: string

  @Prop()
  readAt?: Date

  createdAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
MessageSchema.index({ conversationId: 1, createdAt: 1 })
