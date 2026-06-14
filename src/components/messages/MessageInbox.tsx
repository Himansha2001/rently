import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMessageStore } from '@/store/messageStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
}

export default function MessageInbox() {
  const { user } = useAuthStore()
  const [params, setParams] = useSearchParams()
  const activeId = params.get('c')
  const [draft, setDraft] = useState('')

  const getConversationsForUser = useMessageStore(s => s.getConversationsForUser)
  const getMessages = useMessageStore(s => s.getMessages)
  const fetchConversations = useMessageStore(s => s.fetchConversations)
  const fetchMessages = useMessageStore(s => s.fetchMessages)
  const conversations = user ? getConversationsForUser(user.id) : []
  const sendMessage = useMessageStore(s => s.sendMessage)
  const markRead = useMessageStore(s => s.markRead)

  const active = conversations.find(c => c.id === activeId)
  const messages = active ? getMessages(active.id) : []
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) void fetchConversations()
  }, [user, fetchConversations])

  useEffect(() => {
    if (activeId) void fetchMessages(activeId)
  }, [activeId, fetchMessages])

  useEffect(() => {
    if (active && user) void markRead(active.id, user.id)
  }, [active, user, markRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeId])

  const otherParty = (conv: (typeof conversations)[0]) => {
    const otherId = conv.participantIds.find(id => id !== user?.id)!
    return conv.participantNames[otherId] ?? 'User'
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!active || !user || !draft.trim()) return
    void sendMessage(active.id, user.id, draft)
    setDraft('')
  }

  const selectConversation = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('tab', 'messages')
    next.set('c', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden min-h-[480px] flex flex-col lg:flex-row">
      {/* Conversation list */}
      <div
        className={cn(
          'lg:w-80 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col',
          activeId && 'hidden lg:flex',
        )}
      >
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Inbox</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Chat with landlords or renters about a listing
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-stone-50">
          {conversations.length === 0 ? (
            <li className="p-6 text-center text-sm text-stone-500">
              No messages yet. Open a listing and tap &quot;Message&quot; to start.
            </li>
          ) : (
            conversations.map(conv => {
              const unread = (conv.unreadBy[user?.id ?? ''] ?? 0) > 0
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      'w-full flex gap-3 p-4 text-left hover:bg-stone-50 transition-colors',
                      activeId === conv.id && 'bg-primary-50',
                    )}
                  >
                    <img
                      src={conv.listingImage}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className={cn('text-sm truncate', unread ? 'font-bold' : 'font-medium')}>
                          {otherParty(conv)}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate">{conv.listingTitle}</p>
                      <p className={cn('text-xs truncate mt-0.5', unread ? 'text-stone-800' : 'text-stone-400')}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-2" />
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>

      {/* Thread */}
      <div className={cn('flex-1 flex flex-col min-h-[400px]', !activeId && 'hidden lg:flex')}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500 text-sm">
            Select a conversation to read and reply
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-stone-100 flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100"
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.delete('c')
                  setParams(next, { replace: true })
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={active.listingImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 truncate">{otherParty(active)}</p>
                <Link
                  to={`/listings/${active.listingId}`}
                  className="text-xs text-primary-700 hover:underline truncate block"
                >
                  {active.listingTitle}
                </Link>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
              {messages.map(msg => {
                const mine = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        mine
                          ? 'bg-primary-700 text-white rounded-br-md'
                          : 'bg-white border border-stone-200 text-stone-800 rounded-bl-md',
                      )}
                    >
                      <p>{msg.body}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1',
                          mine ? 'text-primary-200' : 'text-stone-400',
                        )}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-stone-100 flex gap-2">
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!draft.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
