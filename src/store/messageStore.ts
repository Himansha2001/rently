import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/data/mock/conversations'
import type { Conversation, Listing, Message } from '@/types'

interface MessageState {
  conversations: Conversation[]
  messages: Message[]
  getConversationsForUser: (userId: string) => Conversation[]
  getMessages: (conversationId: string) => Message[]
  getUnreadCount: (userId: string) => number
  sendMessage: (conversationId: string, senderId: string, body: string) => void
  markRead: (conversationId: string, userId: string) => void
  openConversationForListing: (listing: Listing, currentUserId: string, currentUserName: string) => string
}

function sortConversations(convs: Conversation[]) {
  return [...convs].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: MOCK_CONVERSATIONS,
      messages: MOCK_MESSAGES,

      getConversationsForUser: userId =>
        sortConversations(
          get().conversations.filter(
            c => Array.isArray(c.participantIds) && c.participantIds.includes(userId),
          ),
        ),

      getMessages: conversationId =>
        get()
          .messages.filter(m => m.conversationId === conversationId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),

      getUnreadCount: userId =>
        get()
          .conversations.filter(c => c.participantIds.includes(userId))
          .reduce((sum, c) => sum + (c.unreadBy[userId] ?? 0), 0),

      sendMessage: (conversationId, senderId, body) => {
        const trimmed = body.trim()
        if (!trimmed) return

        const msg: Message = {
          id: `m-${Date.now()}`,
          conversationId,
          senderId,
          body: trimmed,
          createdAt: new Date().toISOString(),
        }

        set(state => {
          const conversations = state.conversations.map(c => {
            if (c.id !== conversationId) return c
            const otherId = c.participantIds.find(id => id !== senderId)!
            return {
              ...c,
              lastMessage: trimmed,
              lastMessageAt: msg.createdAt,
              unreadBy: {
                ...c.unreadBy,
                [otherId]: (c.unreadBy[otherId] ?? 0) + 1,
                [senderId]: 0,
              },
            }
          })
          return {
            conversations: sortConversations(conversations),
            messages: [...state.messages, msg],
          }
        })
      },

      markRead: (conversationId, userId) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? { ...c, unreadBy: { ...c.unreadBy, [userId]: 0 } }
              : c,
          ),
        }))
      },

      openConversationForListing: (listing, currentUserId, currentUserName) => {
        const existing = get().conversations.find(
          c =>
            c.listingId === listing.id &&
            c.participantIds.includes(currentUserId) &&
            c.participantIds.includes(listing.ownerId),
        )
        if (existing) return existing.id

        if (currentUserId === listing.ownerId) {
          const own = get().conversations.find(
            c => c.listingId === listing.id && c.participantIds.includes(currentUserId),
          )
          if (own) return own.id
        }

        const conv: Conversation = {
          id: `conv-${Date.now()}`,
          listingId: listing.id,
          listingTitle: listing.title,
          listingImage: listing.images[0] ?? '',
          participantIds: [currentUserId, listing.ownerId],
          participantNames: {
            [currentUserId]: currentUserName,
            [listing.ownerId]: listing.ownerName,
          },
          lastMessage: 'Started a conversation',
          lastMessageAt: new Date().toISOString(),
          unreadBy: { [currentUserId]: 0, [listing.ownerId]: 0 },
        }

        const starter: Message = {
          id: `m-${Date.now()}`,
          conversationId: conv.id,
          senderId: currentUserId,
          body: `Hi, I'm interested in "${listing.title}". Is it still available?`,
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          conversations: sortConversations([conv, ...state.conversations]),
          messages: [...state.messages, starter],
        }))

        return conv.id
      },
    }),
    { name: 'rently-messages' },
  ),
)
