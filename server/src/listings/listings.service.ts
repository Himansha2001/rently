import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose'
import { UsersService } from '../users/users.service'
import type { UserDocument } from '../users/user.schema'
import { CreateListingDto } from './dto/create-listing.dto'
import { ListingQueryDto } from './dto/listing-query.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { Listing, ListingDocument, ListingStatus } from './listing.schema'

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private readonly listingModel: Model<Listing>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async search(query: ListingQueryDto = {}, viewer?: UserDocument) {
    const normalizedQuery = normalizeListingQuery(query)
    const page = normalizedQuery.page ?? 1
    const limit = normalizedQuery.limit ?? 20
    const skip = (page - 1) * limit
    const filter = this.buildPublicFilter(normalizedQuery)

    if (hasRadiusQuery(normalizedQuery)) {
      const maxDistance = Math.min(normalizedQuery.radiusKm ?? 10, 100) * 1000
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [normalizedQuery.lng, normalizedQuery.lat],
            },
            distanceField: 'distanceMeters',
            maxDistance,
            spherical: true,
            query: filter,
          },
        },
        {
          $facet: {
            items: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: 'total' }],
          },
        },
      ]

      const [result] = await this.listingModel.aggregate<{
        items: Array<Listing & { _id: Types.ObjectId; distanceMeters?: number }>
        meta: Array<{ total: number }>
      }>(pipeline)

      return {
        items: (result?.items ?? []).map(listing => this.toResponse(listing, viewer)),
        page,
        limit,
        total: result?.meta[0]?.total ?? 0,
      }
    }

    const [items, total] = await Promise.all([
      this.listingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.listingModel.countDocuments(filter),
    ])

    return {
      items: items.map(listing => this.toResponse(listing, viewer)),
      page,
      limit,
      total,
    }
  }

  async findMine(owner: UserDocument) {
    const listings = await this.listingModel.find({ ownerId: owner._id }).sort({ createdAt: -1 })
    return listings.map(listing => this.toResponse(listing, owner, { includeSensitive: true }))
  }

  async findById(id: string, viewer?: UserDocument) {
    const listing = await this.listingModel.findById(id)
    if (!listing) throw new NotFoundException('Listing not found')

    const canViewPrivate =
      Boolean(viewer) &&
      (listing.ownerId.equals(viewer!._id) || viewer!.roles.includes('admin'))

    if (listing.status !== 'approved' && !canViewPrivate) {
      throw new NotFoundException('Listing not found')
    }

    return this.toResponse(listing, viewer, { includeSensitive: Boolean(viewer) })
  }

  async create(owner: UserDocument, dto: CreateListingDto) {
    const listing = await this.listingModel.create({
      ownerId: owner._id,
      title: dto.title,
      description: dto.description,
      propertyType: dto.propertyType,
      price: dto.price,
      currency: dto.currency ?? 'LKR',
      address: dto.address,
      city: dto.city,
      district: dto.district,
      province: dto.province,
      location: {
        type: 'Point',
        coordinates: [dto.lng, dto.lat],
      },
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      areaSqFt: dto.areaSqFt,
      amenities: dto.amenities ?? [],
      imageUrls: dto.imageUrls ?? [],
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail ?? owner.email,
      status: 'pending',
      isVerified: false,
      isFeatured: false,
    })

    await this.usersService.ensureRole(owner._id, 'landlord')
    return this.toResponse(listing, owner, { includeSensitive: true })
  }

  async update(id: string, user: UserDocument, dto: UpdateListingDto) {
    const listing = await this.getOwnedListing(id, user)

    const hasLat = Object.prototype.hasOwnProperty.call(dto, 'lat')
    const hasLng = Object.prototype.hasOwnProperty.call(dto, 'lng')
    if (hasLat !== hasLng) {
      throw new BadRequestException('Both lat and lng are required to update location')
    }

    if (dto.lat !== undefined && dto.lng !== undefined) {
      listing.location = {
        type: 'Point',
        coordinates: [dto.lng, dto.lat],
      }
    }

    const allowedFields: Array<keyof UpdateListingDto> = [
      'title',
      'description',
      'propertyType',
      'price',
      'currency',
      'address',
      'city',
      'district',
      'province',
      'bedrooms',
      'bathrooms',
      'areaSqFt',
      'amenities',
      'imageUrls',
      'contactName',
      'contactPhone',
      'contactEmail',
    ]

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(dto, field) && dto[field] !== undefined) {
        Object.assign(listing, { [field]: dto[field] })
      }
    }

    if (listing.status === 'approved' || listing.status === 'rejected') {
      listing.status = 'pending'
      listing.rejectionReason = undefined
      listing.approvedAt = undefined
      listing.approvedBy = undefined
      listing.isVerified = false
    }

    await listing.save()
    return this.toResponse(listing, user, { includeSensitive: true })
  }

  async archiveOwned(id: string, user: UserDocument) {
    const listing = await this.getOwnedListing(id, user)
    listing.status = 'archived'
    await listing.save()
    return this.toResponse(listing, user, { includeSensitive: true })
  }

  async incrementViews(id: string) {
    await this.listingModel.updateOne({ _id: id, status: 'approved' }, { $inc: { views: 1 } })
    return { ok: true }
  }

  async findForAdmin(status?: ListingStatus, page = 1, limit = 20) {
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(Math.max(1, limit), 100)
    const skip = (safePage - 1) * safeLimit
    const filter: FilterQuery<Listing> = status ? { status } : {}
    const [items, total] = await Promise.all([
      this.listingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      this.listingModel.countDocuments(filter),
    ])

    return {
      items,
      page: safePage,
      limit: safeLimit,
      total,
    }
  }

  async approve(id: string, admin: UserDocument) {
    const listing = await this.findListingOrThrow(id)
    if (listing.ownerId.equals(admin._id)) {
      throw new ForbiddenException('Owner cannot approve their own listing')
    }
    listing.status = 'approved'
    listing.isVerified = true
    listing.rejectionReason = undefined
    listing.approvedAt = new Date()
    listing.approvedBy = admin._id
    await listing.save()
    return this.toResponse(listing, admin, { includeSensitive: true, admin: true })
  }

  async reject(id: string, admin: UserDocument, reason: string) {
    const listing = await this.findListingOrThrow(id)
    listing.status = 'rejected'
    listing.rejectionReason = reason
    listing.approvedAt = undefined
    listing.approvedBy = undefined
    listing.isVerified = false
    await listing.save()
    return this.toResponse(listing, admin, { includeSensitive: true, admin: true })
  }

  async feature(id: string, admin: UserDocument, featured: boolean) {
    const listing = await this.findListingOrThrow(id)
    listing.isFeatured = featured
    await listing.save()
    return this.toResponse(listing, admin, { includeSensitive: true, admin: true })
  }

  async archiveByAdmin(id: string, admin: UserDocument) {
    const listing = await this.findListingOrThrow(id)
    listing.status = 'archived'
    await listing.save()
    return this.toResponse(listing, admin, { includeSensitive: true, admin: true })
  }

  async findListingOrThrow(id: string) {
    const listing = await this.listingModel.findById(id)
    if (!listing) throw new NotFoundException('Listing not found')
    return listing
  }

  toResponse(
    listing: ListingDocument | (Listing & { _id: Types.ObjectId; distanceMeters?: number }),
    viewer?: UserDocument,
    options: { includeSensitive?: boolean; admin?: boolean } = {},
  ) {
    const plain = typeof (listing as ListingDocument).toObject === 'function'
      ? (listing as ListingDocument).toObject()
      : listing
    const [lng, lat] = plain.location.coordinates
    const includeSensitive = options.includeSensitive || Boolean(viewer)

    const response: Record<string, unknown> = {
      id: plain._id.toString(),
      ownerId: plain.ownerId.toString(),
      title: plain.title,
      description: plain.description,
      propertyType: plain.propertyType,
      price: plain.price,
      currency: plain.currency,
      address: plain.address,
      city: plain.city,
      district: plain.district,
      province: plain.province,
      lat,
      lng,
      location: plain.location,
      bedrooms: plain.bedrooms,
      bathrooms: plain.bathrooms,
      areaSqFt: plain.areaSqFt,
      amenities: plain.amenities,
      images: plain.imageUrls,
      imageUrls: plain.imageUrls,
      status: plain.status,
      isVerified: plain.isVerified,
      isFeatured: plain.isFeatured,
      verified: plain.isVerified,
      featured: plain.isFeatured,
      views: plain.views,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
      approvedAt: plain.approvedAt,
      distanceKm: getDistanceMeters(plain) ? Math.round((getDistanceMeters(plain)! / 1000) * 100) / 100 : undefined,
    }

    if (includeSensitive) {
      response.contactName = plain.contactName
      response.contactPhone = plain.contactPhone
      response.contactEmail = plain.contactEmail
      response.ownerName = plain.contactName
      response.ownerPhone = plain.contactPhone
      response.rejectionReason = plain.rejectionReason
    }

    if (options.admin) {
      response.approvedBy = plain.approvedBy?.toString()
    }

    return response
  }

  private async getOwnedListing(id: string, user: UserDocument) {
    const listing = await this.findListingOrThrow(id)
    if (!listing.ownerId.equals(user._id)) {
      throw new ForbiddenException('Only the owner can modify this listing')
    }
    return listing
  }

  private buildPublicFilter(query: ListingQueryDto): FilterQuery<Listing> {
    const filter: FilterQuery<Listing> = { status: 'approved' }
    if (query.query) {
      const regex = new RegExp(escapeRegex(query.query), 'i')
      filter.$or = [
        { title: regex },
        { description: regex },
        { address: regex },
        { city: regex },
        { district: regex },
        { province: regex },
      ]
    }
    if (query.city) filter.city = query.city
    if (query.propertyType) filter.propertyType = query.propertyType
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {}
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice
    }
    if (query.bedrooms !== undefined) filter.bedrooms = { $gte: query.bedrooms }
    if (query.bathrooms !== undefined) filter.bathrooms = { $gte: query.bathrooms }
    if (query.verified !== undefined) filter.isVerified = query.verified
    if (query.featured !== undefined) filter.isFeatured = query.featured
    return filter
  }
}

function hasRadiusQuery(query: ListingQueryDto): query is ListingQueryDto & {
  lat: number
  lng: number
  radiusKm: number
} {
  return query.lat !== undefined && query.lng !== undefined && query.radiusKm !== undefined
}

function normalizeListingQuery(query: ListingQueryDto): ListingQueryDto {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(Math.max(1, query.limit ?? 20), 50)

  return {
    ...query,
    query: query.query ?? query.search ?? query.q,
    propertyType: query.propertyType ?? query.type,
    verified: query.verified ?? query.isVerified,
    featured: query.featured ?? query.isFeatured,
    page,
    limit,
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getDistanceMeters(listing: unknown) {
  return typeof listing === 'object' &&
    listing !== null &&
    'distanceMeters' in listing &&
    typeof (listing as { distanceMeters?: unknown }).distanceMeters === 'number'
    ? (listing as { distanceMeters: number }).distanceMeters
    : undefined
}
