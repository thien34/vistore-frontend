'use client'
import { ChatHistory, ChatRequest, User } from '@/interface/chat.interface'
import { ChatMessage } from '@/interface/chat.interface'
import React, { useEffect, useState, useRef, useCallback } from 'react'

export default function ChatPage() {
    const [message, setMessage] = useState<string>('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [userId, setUserId] = useState<number | null>(null)
    const [receiverId, setReceiverId] = useState<number | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
    const chatBoxRef = useRef<HTMLDivElement>(null)
    const api = 'http://localhost:8080/api'

    const fetchUsers = async () => {
        const hardcodedUsers: User[] = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' },
            { id: 3, name: 'User 3' },
            { id: 4, name: 'User 4' },
            { id: 5, name: 'User 5' }
        ]
        setUsers(hardcodedUsers)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchChatHistory = useCallback(async () => {
        if (!userId) return
        try {
            const response = await fetch(`${api}/chat/history?userId=${userId}`)
            const data = await response.json()
            setChatHistory(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching chat history:', error)
            setChatHistory([])
        }
    }, [userId])

    useEffect(() => {
        if (userId) {
            fetchChatHistory()
            const interval = setInterval(fetchChatHistory, 5000)
            return () => clearInterval(interval)
        }
    }, [userId, fetchChatHistory])

    const handleUserSelect = (selectedUserId: number) => {
        setReceiverId(selectedUserId)
        const selected = users.find((u) => u.id === selectedUserId)
        setSelectedUser(selected || null)
        fetchMessages()
    }

    const sendMessage = async () => {
        if (!userId || !receiverId) {
            alert('Please enter both user IDs first')
            return
        }
        if (!message.trim()) {
            alert('Please type a message')
            return
        }

        try {
            const chatRequest: ChatRequest = {
                senderId: userId,
                receiverId,
                message: message.trim()
            }

            await fetch(`${api}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chatRequest)
            })
            setMessage('')
            await fetchMessages()
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const fetchMessages = useCallback(async () => {
        if (!userId || !receiverId) return
        try {
            const response = await fetch(`${api}/chat/conversation?senderId=${userId}&receiverId=${receiverId}`)
            const data = await response.json()
            setMessages(data)

            if (chatBoxRef.current) {
                chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }, [userId, receiverId])

    useEffect(() => {
        if (userId && receiverId) {
            fetchMessages()
            const interval = setInterval(fetchMessages, 2000)
            return () => clearInterval(interval)
        }
    }, [userId, receiverId, fetchMessages])

    useEffect(() => {
        const savedUserId = localStorage.getItem('chatUserId')
        if (savedUserId) {
            const userId = Number(savedUserId)
            setUserId(userId)
            const current = users.find((u) => u.id === userId)
            setSelectedUser(current || null)
        }
    }, [users])

    if (!userId) {
        return (
            <div className='container mx-auto p-4 max-w-3xl'>
                <h1 className='text-3xl font-bold mb-6 text-center text-gray-800'>Start Chat</h1>
                <div>
                    <label className='block text-sm font-medium text-gray-700'>Select Your ID:</label>
                    <select
                        value={userId || ''}
                        onChange={(e) => {
                            const selectedId = Number(e.target.value)
                            setUserId(selectedId)
                            localStorage.setItem('chatUserId', selectedId.toString())
                            const current = users.find((u) => u.id === selectedId)
                            setSelectedUser(current || null)
                        }}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                        required
                    >
                        <option value=''>Select your ID</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} (ID: {user.id})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto p-4'>
            <div className='flex gap-4'>
                <div className='w-1/3 bg-white rounded-lg shadow-lg p-4'>
                    <h2 className='text-xl font-bold mb-4'>Chat History</h2>
                    <div className='space-y-2'>
                        {chatHistory.map((chat) => (
                            <div
                                key={chat.userId}
                                onClick={() => handleUserSelect(chat.userId)}
                                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                                    receiverId === chat.userId ? 'bg-blue-100' : ''
                                }`}
                            >
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <div className='font-medium'>{chat.userName}</div>
                                        <div className='text-sm text-gray-500 truncate'>{chat.lastMessage}</div>
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                        {new Date(chat.lastMessageTime).toLocaleTimeString()}
                                        {chat.unreadCount > 0 && (
                                            <span className='ml-2 bg-blue-500 text-white px-2 py-1 rounded-full'>
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex-1'>
                    {receiverId ? (
                        <div className='bg-white rounded-lg shadow-lg'>
                            <div className='border-b p-4'>
                                <div className='text-lg font-bold'>{selectedUser?.name}</div>
                            </div>
                            <div className='p-4'>
                                <div ref={chatBoxRef} className='h-[600px] overflow-y-auto'>
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-4 ${
                                                msg.sender.id === userId
                                                    ? 'flex flex-col items-end'
                                                    : 'flex flex-col items-start'
                                            }`}
                                        >
                                            <div
                                                className={`text-xs mb-1 ${
                                                    msg.sender.id === userId ? 'text-right' : 'text-left'
                                                } text-gray-600`}
                                            >
                                                {msg.sender.name}
                                            </div>
                                            <div
                                                className={`p-3 rounded-2xl ${
                                                    msg.sender.id === userId
                                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                                        : 'bg-white text-gray-700 shadow-sm rounded-tl-none'
                                                } max-w-[80%]`}
                                            >
                                                <div className='text-sm'>{msg.message}</div>
                                                <div className='text-xs mt-1 opacity-70'>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='flex gap-3 mt-4'>
                                    <input
                                        type='text'
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder='Type your message'
                                        className='flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm'
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className='bg-blue-500 text-white py-3 px-8 rounded-full hover:bg-blue-600 transition-colors shadow-sm font-medium'
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='h-full flex items-center justify-center text-gray-500'>
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
