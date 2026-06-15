import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import type { UserDocument } from '../users/user.schema'

export interface UploadedImageFile {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_LISTING_IMAGES = 10
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
])

@Injectable()
export class StorageService {
  private readonly client: S3Client

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: this.config.get<string>('S3_REGION') ?? 'auto',
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY') ?? '',
      },
    })
  }

  async uploadListingImages(user: UserDocument, files: UploadedImageFile[]) {
    if (!files.length) {
      throw new BadRequestException('At least one listing image is required')
    }
    if (files.length > MAX_LISTING_IMAGES) {
      throw new BadRequestException(`Maximum ${MAX_LISTING_IMAGES} listing images are allowed`)
    }

    const bucket = this.config.get<string>('S3_BUCKET')
    if (!bucket) {
      throw new InternalServerErrorException('Object storage is not configured')
    }

    const imageUrls: string[] = []
    for (const file of files) {
      const extension = ALLOWED_IMAGE_TYPES.get(file.mimetype)
      if (!extension) {
        throw new BadRequestException('Only JPEG, PNG, WebP, and AVIF images are allowed')
      }
      if (file.size > MAX_LISTING_IMAGE_BYTES) {
        throw new BadRequestException('Each listing image must be 5MB or smaller')
      }

      const key = this.createListingImageKey(user, extension)
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      )
      imageUrls.push(this.publicUrlFor(key, bucket))
    }

    return { imageUrls, urls: imageUrls }
  }

  private createListingImageKey(user: UserDocument, extension: string) {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    return `listing-images/${user._id.toString()}/${year}/${month}/${randomUUID()}.${extension}`
  }

  private publicUrlFor(key: string, bucket: string) {
    const publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL')?.replace(/\/+$/, '')
    if (publicBaseUrl) return `${publicBaseUrl}/${key}`

    const endpoint = this.config.get<string>('S3_ENDPOINT')?.replace(/\/+$/, '')
    if (endpoint) return `${endpoint}/${bucket}/${key}`

    const region = this.config.get<string>('S3_REGION') ?? 'us-east-1'
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }
}
