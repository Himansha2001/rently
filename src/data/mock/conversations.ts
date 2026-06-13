import type { Conversation, Message } from '@/types'

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    listingId: '1',
    listingTitle: 'Modern 2BR Apartment in Colombo 7',
    listingImage:
      'https://images.unsplash.com/photo-1522708323590-24aafb2f6c5c?auto=format&fit=crop&w=200&q=80',
    participantIds: ['u1', 'tenant-1'],
    participantNames: {
      u1: 'Nimal Perera',
      'tenant-1': 'Amaya Fernando',
    },
    lastMessage: 'Is the apartment still available from next month?',
    lastMessageAt: '2026-05-28T14:30:00Z',
    unreadBy: { u1: 1, 'tenant-1': 0 },
  },
  {
    id: 'conv-2',
    listingId: '5',
    listingTitle: '3BR House with Garden — Battaramulla',
    listingImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=200&q=80',
    participantIds: ['u1', 'tenant-2'],
    participantNames: {
      u1: 'Nimal Perera',
      'tenant-2': 'Dilshan Perera',
    },
    lastMessage: 'We can arrange a viewing this Saturday if that works.',
    lastMessageAt: '2026-05-27T09:15:00Z',
    unreadBy: { u1: 0, 'tenant-2': 0 },
  },
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversationId: 'conv-1',
    senderId: 'tenant-1',
    body: 'Hi, I saw your listing on Rently. Is the apartment still available from next month?',
    createdAt: '2026-05-28T14:20:00Z',
  },
  {
    id: 'm2',
    conversationId: 'conv-1',
    senderId: 'u1',
    body: 'Hello Amaya! Yes, it’s available from 1 June. Would you like to schedule a viewing?',
    createdAt: '2026-05-28T14:25:00Z',
  },
  {
    id: 'm3',
    conversationId: 'conv-1',
    senderId: 'tenant-1',
    body: 'Is the apartment still available from next month?',
    createdAt: '2026-05-28T14:30:00Z',
  },
  {
    id: 'm4',
    conversationId: 'conv-2',
    senderId: 'tenant-2',
    body: 'Interested in the Battaramulla house for my family. Is the garden fully fenced?',
    createdAt: '2026-05-26T16:00:00Z',
  },
  {
    id: 'm5',
    conversationId: 'conv-2',
    senderId: 'u1',
    body: 'Yes, fully fenced and gated. Happy to share more photos.',
    createdAt: '2026-05-27T08:50:00Z',
  },
  {
    id: 'm6',
    conversationId: 'conv-2',
    senderId: 'u1',
    body: 'We can arrange a viewing this Saturday if that works.',
    createdAt: '2026-05-27T09:15:00Z',
  },
]
