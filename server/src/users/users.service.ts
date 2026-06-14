import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { UpdateMeDto } from './dto/update-me.dto'
import { User, UserDocument, UserRole } from './user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async upsertFromFirebaseToken(decoded: DecodedIdToken): Promise<UserDocument> {
    const email = decoded.email?.toLowerCase()
    if (!email) {
      throw new NotFoundException('Firebase account email is required')
    }

    const displayName =
      decoded.name ??
      (typeof decoded.firebase?.sign_in_provider === 'string' ? email.split('@')[0] : undefined)

    const user = await this.userModel.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          email,
          roles: ['user'],
          status: 'active',
        },
        $set: {
          email,
          displayName,
          name: displayName,
          avatarUrl: decoded.picture,
          isEmailVerified: decoded.email_verified ?? false,
        },
      },
      { new: true, upsert: true },
    )

    return user
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findById(id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateMe(userId: Types.ObjectId, dto: UpdateMeDto): Promise<UserDocument> {
    const patch: Partial<User> = {}
    if (dto.displayName !== undefined) {
      patch.displayName = dto.displayName
      patch.name = dto.name ?? dto.displayName
    }
    if (dto.name !== undefined) {
      patch.name = dto.name
      patch.displayName = dto.displayName ?? dto.name
    }
    if (dto.phone !== undefined) patch.phone = dto.phone
    if (dto.avatarUrl !== undefined) patch.avatarUrl = dto.avatarUrl

    const user = await this.userModel.findByIdAndUpdate(userId, patch, { new: true })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async ensureRole(userId: Types.ObjectId, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: role } },
      { new: true },
    )
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  toSafeProfile(user: UserDocument) {
    return {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      name: user.name ?? user.displayName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
