import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ListingsService } from '../listings/listings.service'
import { UsersService } from '../users/users.service'
import type { UserDocument } from '../users/user.schema'
import { Conversation, ConversationDocument } from './conversation.schema'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { MessageQueryDto } from './dto/message-query.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { Message } from './message.schema'

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly listingsService: ListingsService,
    private readonly usersService: UsersService,
  ) {}

  async listConversations(user: UserDocument) {
    const conversations = await this.conversationModel
      .find({ participantIds: user._id })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
    const participantNames = await this.getParticipantNames(conversations)
    return conversations.map(conversation =>
      this.toConversationResponse(conversation, user, participantNames),
    )
  }

  async openConversation(user: UserDocument, dto: CreateConversationDto) {
    const listing = await this.listingsService.findListingOrThrow(dto.listingId)
    if (listing.status !== 'approved' && !listing.ownerId.equals(user._id)) {
      throw new NotFoundException('Listing not found')
    }
    if (listing.ownerId.equals(user._id)) {
      throw new ForbiddenException('Owners cannot start a renter conversation with their own listing')
    }

    const conversation = await this.conversationModel.findOneAndUpdate(
      {
        listingId: listing._id,
        renterId: user._id,
        landlordId: listing.ownerId,
      },
      {
        $setOnInsert: {
          listingId: listing._id,
          participantIds: [user._id, listing.ownerId],
          renterId: user._id,
          landlordId: listing.ownerId,
          listingTitle: listing.title,
          listingImage: listing.imageUrls[0],
          lastMessage: 'Started a conversation',
          lastMessageAt: new Date(),
          unreadCounts: new Map([
            [user._id.toString(), 0],
            [listing.ownerId.toString(), 0],
          ]),
        },
      },
      { upsert: true, new: true },
    )

    return this.toConversationResponse(
      conversation,
      user,
      await this.getParticipantNames([conversation]),
    )
  }

  async listMessages(user: UserDocument, conversationId: string, query: MessageQueryDto = {}) {
    await this.requireParticipant(user, conversationId)
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(Math.max(1, limit), 100)
    const skip = (safePage - 1) * safeLimit

    const [messages, total] = await Promise.all([
      this.messageModel.find({ conversationId }).sort({ createdAt: 1 }).skip(skip).limit(safeLimit),
      this.messageModel.countDocuments({ conversationId }),
    ])

    return {
      items: messages.map(message => this.toMessageResponse(message)),
      page: safePage,
      limit: safeLimit,
      total,
    }
  }

  async sendMessage(user: UserDocument, conversationId: string, dto: SendMessageDto) {
    const conversation = await this.requireParticipant(user, conversationId)
    const body = dto.body.trim()
    const message = await this.messageModel.create({
      conversationId: conversation._id,
      senderId: user._id,
      body,
    })

    const otherIds = conversation.participantIds
      .map(id => id.toString())
      .filter(id => id !== user._id.toString())

    for (const id of otherIds) {
      conversation.unreadCounts.set(id, (conversation.unreadCounts.get(id) ?? 0) + 1)
    }
    conversation.unreadCounts.set(user._id.toString(), 0)
    conversation.lastMessage = body
    conversation.lastMessageAt = new Date()
    await conversation.save()

    return this.toMessageResponse(message)
  }

  async markRead(user: UserDocument, conversationId: string) {
    const conversation = await this.requireParticipant(user, conversationId)
    await this.messageModel.updateMany(
      { conversationId: conversation._id, senderId: { $ne: user._id }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    )
    conversation.unreadCounts.set(user._id.toString(), 0)
    await conversation.save()
    return this.toConversationResponse(
      conversation,
      user,
      await this.getParticipantNames([conversation]),
    )
  }

  private async requireParticipant(user: UserDocument, conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId)
    if (!conversation) throw new NotFoundException('Conversation not found')
    if (!conversation.participantIds.some(id => id.equals(user._id))) {
      throw new ForbiddenException('You are not a participant in this conversation')
    }
    return conversation
  }

  private toConversationResponse(
    conversation: ConversationDocument,
    user: UserDocument,
    participantNames: Record<string, string> = {},
  ) {
    const participantIds = conversation.participantIds.map(id => id.toString())
    const viewerId = user._id.toString()
    return {
      id: conversation._id.toString(),
      listingId: conversation.listingId.toString(),
      listingTitle: conversation.listingTitle,
      listingImage: conversation.listingImage,
      participantIds,
      landlordId: conversation.landlordId.toString(),
      renterId: conversation.renterId.toString(),
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCounts.get(viewerId) ?? 0,
      unreadBy: { [viewerId]: conversation.unreadCounts.get(viewerId) ?? 0 },
      participantNames: Object.fromEntries(
        participantIds.map(id => [id, participantNames[id] ?? 'User']),
      ),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }
  }

  private toMessageResponse(message: Message & { _id: Types.ObjectId }) {
    return {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      body: message.body,
      readAt: message.readAt,
      createdAt: message.createdAt,
    }
  }

  private async getParticipantNames(conversations: ConversationDocument[]) {
    const ids = Array.from(
      new Map(
        conversations
          .flatMap(conversation => conversation.participantIds)
          .map(id => [id.toString(), id]),
      ).values(),
    )
    if (!ids.length) return {}

    const users = await this.usersService.findByIds(ids)
    return Object.fromEntries(
      users.map(user => [
        user._id.toString(),
        user.displayName ?? user.name ?? user.email ?? 'User',
      ]),
    )
  }
}
