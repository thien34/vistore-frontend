
export interface ChatMessage {
    id: number
    sender: {
        id: number
        name: string
    }
    receiver: {
        id: number
        name: string
    }
    message: string
    timestamp: string
}

export interface ChatRequest {
    senderId: number
    receiverId: number
    message: string
}

export interface User {
    id: number
    name: string
}

export interface ChatHistory {
    userId: number
    userName: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
}
