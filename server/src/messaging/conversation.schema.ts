import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

export type ConversationDocument = HydratedDocument<Conversation>

@Schema({ timestamps: true })
export class Conversation {
  _id: Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: Types.ObjectId

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', required: true, index: true })
  participantIds: Types.ObjectId[]

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  landlordId: Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  renterId: Types.ObjectId

  @Prop({ type: String, required: true })
  listingTitle: string

  @Prop({ type: String })
  listingImage?: string

  @Prop({ type: String })
  lastMessage?: string

  @Prop({ type: Date })
  lastMessageAt?: Date

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts: Map<string, number>

  createdAt: Date
  updatedAt: Date
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)
ConversationSchema.index({ listingId: 1, renterId: 1, landlordId: 1 }, { unique: true })
ConversationSchema.index({ participantIds: 1, updatedAt: -1 })
