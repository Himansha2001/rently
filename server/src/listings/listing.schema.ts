import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

export type PropertyType = 'apartment' | 'annex' | 'room' | 'condo' | 'house' | 'commercial'
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'

export type ListingDocument = HydratedDocument<Listing>

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, required: true, enum: ['Point'], default: 'Point' })
  type: 'Point'

  @Prop({ required: true, type: [Number] })
  coordinates: [number, number]
}

const GeoPointSchema = SchemaFactory.createForClass(GeoPoint)

@Schema({ timestamps: true })
export class Listing {
  _id: Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId

  @Prop({ type: String, required: true, trim: true, maxlength: 160, index: 'text' })
  title: string

  @Prop({ type: String, required: true, trim: true, maxlength: 5000, index: 'text' })
  description: string

  @Prop({
    type: String,
    required: true,
    enum: ['apartment', 'annex', 'room', 'condo', 'house', 'commercial'],
    index: true,
  })
  propertyType: PropertyType

  @Prop({ type: Number, required: true, min: 0, index: true })
  price: number

  @Prop({ type: String, required: true, default: 'LKR' })
  currency: string

  @Prop({ type: String, required: true, trim: true, maxlength: 500, index: 'text' })
  address: string

  @Prop({ type: String, required: true, trim: true, index: true })
  city: string

  @Prop({ type: String, required: true, trim: true, index: true })
  district: string

  @Prop({ type: String, trim: true, index: true })
  province?: string

  @Prop({ required: true, type: GeoPointSchema })
  location: GeoPoint

  @Prop({ type: Number, required: true, min: 0, default: 0, index: true })
  bedrooms: number

  @Prop({ type: Number, required: true, min: 0, default: 1, index: true })
  bathrooms: number

  @Prop({ type: Number, min: 0 })
  areaSqFt?: number

  @Prop({ type: [String], default: [] })
  amenities: string[]

  @Prop({ type: [String], default: [] })
  imageUrls: string[]

  @Prop({ type: String, required: true, trim: true, maxlength: 100 })
  contactName: string

  @Prop({ type: String, trim: true, maxlength: 32 })
  contactPhone?: string

  @Prop({ type: String, trim: true, lowercase: true, maxlength: 180 })
  contactEmail?: string

  @Prop({
    type: String,
    default: 'pending',
    enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
    index: true,
  })
  status: ListingStatus

  @Prop({ type: String, trim: true, maxlength: 1000 })
  rejectionReason?: string

  @Prop({ type: Boolean, default: false, index: true })
  isVerified: boolean

  @Prop({ type: Boolean, default: false, index: true })
  isFeatured: boolean

  @Prop({ type: Number, default: 0 })
  views: number

  @Prop({ type: Date })
  approvedAt?: Date

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

export const ListingSchema = SchemaFactory.createForClass(Listing)
ListingSchema.index({ location: '2dsphere' })
ListingSchema.index({ title: 'text', description: 'text', address: 'text', city: 'text', district: 'text' })
ListingSchema.index({ status: 1, city: 1, propertyType: 1, price: 1 })
ListingSchema.index({ ownerId: 1, status: 1, createdAt: -1 })
