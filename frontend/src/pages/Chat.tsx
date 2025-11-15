import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatsApi } from '../api/chats'
import { usersApi } from '../api/users'

export default function Chat() {
  const { userId } = useParams<{ userId: string }>()
  const receiverId = parseInt(userId || '0')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Note: In a full implementation, you'd fetch the receiver user by ID
  // For now, we'll just use the receiverId from the URL

  const { data: messages } = useQuery({
    queryKey: ['chat', receiverId],
    queryFn: () => chatsApi.getConversation(receiverId),
    refetchInterval: 2000, // Poll every 2 seconds
  })

  const sendMutation = useMutation({
    mutationFn: chatsApi.send,
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['chat', receiverId] })
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendMutation.mutate({ receiver_id: receiverId, message })
    }
  }

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Chat (User ID: {receiverId})
      </h1>

      <div className="bg-white rounded-lg shadow-sm flex flex-col" style={{ height: '600px' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages?.map((msg) => {
            const isOwn = msg.sender_id === currentUser?.id
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={sendMutation.isPending || !message.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

