import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

export type MessageDocument = HydratedDocument<Message>

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  _id: Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId

  @Prop({ type: String, required: true, trim: true, maxlength: 4000 })
  body: string

  @Prop({ type: Date })
  readAt?: Date

  createdAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
MessageSchema.index({ conversationId: 1, createdAt: 1 })
