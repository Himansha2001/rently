import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import type { Conversation, Listing, Message } from '@/types'

interface MessageState {
  conversations: Conversation[]
  messagesByConversation: Record<string, Message[]>
  loading: boolean
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  getConversationsForUser: (userId: string) => Conversation[]
  getMessages: (conversationId: string) => Message[]
  getUnreadCount: (userId: string) => number
  sendMessage: (conversationId: string, senderId: string, body: string) => Promise<void>
  markRead: (conversationId: string, userId: string) => Promise<void>
  openConversationForListing: (listing: Listing, currentUserId: string, currentUserName: string) => Promise<string>
}

interface BackendConversation {
  id: string
  listingId: string
  listingTitle: string
  listingImage?: string
  participantIds: string[]
  participantNames?: Record<string, string>
  lastMessage?: string
  lastMessageAt?: string
  unreadBy?: Record<string, number>
}

function normalizeConversation(c: BackendConversation): Conversation {
  const participantIds = c.participantIds.slice(0, 2) as [string, string]
  return {
    id: c.id,
    listingId: c.listingId,
    listingTitle: c.listingTitle,
    listingImage: c.listingImage ?? '',
    participantIds,
    participantNames: c.participantNames ?? Object.fromEntries(participantIds.map(id => [id, 'User'])),
    lastMessage: c.lastMessage ?? '',
    lastMessageAt: c.lastMessageAt ?? new Date().toISOString(),
    unreadBy: c.unreadBy ?? {},
  }
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  loading: false,

  fetchConversations: async () => {
    set({ loading: true })
    const conversations = await apiFetch<BackendConversation[]>('/conversations', { auth: true })
    set({ conversations: conversations.map(normalizeConversation), loading: false })
  },

  fetchMessages: async conversationId => {
    const messages = await apiFetch<Message[]>(`/conversations/${conversationId}/messages`, { auth: true })
    set(state => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    }))
  },

  getConversationsForUser: userId =>
    get()
      .conversations.filter(c => c.participantIds.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),

  getMessages: conversationId =>
    [...(get().messagesByConversation[conversationId] ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),

  getUnreadCount: userId =>
    get()
      .conversations.filter(c => c.participantIds.includes(userId))
      .reduce((sum, c) => sum + (c.unreadBy[userId] ?? 0), 0),

  sendMessage: async (conversationId, _senderId, body) => {
    const trimmed = body.trim()
    if (!trimmed) return
    const message = await apiFetch<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ body: trimmed }),
    })
    set(state => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
      conversations: state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: trimmed, lastMessageAt: message.createdAt }
          : c,
      ),
    }))
  },

  markRead: async (conversationId, userId) => {
    const conversation = await apiFetch<BackendConversation>(`/conversations/${conversationId}/read`, {
      method: 'PATCH',
      auth: true,
    })
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId
          ? { ...normalizeConversation(conversation), unreadBy: { ...c.unreadBy, [userId]: 0 } }
          : c,
      ),
    }))
  },

  openConversationForListing: async listing => {
    const conversation = await apiFetch<BackendConversation>('/conversations', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ listingId: listing.id }),
    })
    const normalized = normalizeConversation(conversation)
    set(state => {
      const exists = state.conversations.some(c => c.id === normalized.id)
      return {
        conversations: exists
          ? state.conversations.map(c => (c.id === normalized.id ? normalized : c))
          : [normalized, ...state.conversations],
      }
    })
    return normalized.id
  },
}))
