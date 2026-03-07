'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from 'apps/seller-ui/src/context/webSocketContext'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import ChatInput from 'apps/seller-ui/src/shared/components/ChatInput'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const page = () => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const messageContainerRef = useRef<HTMLDivElement | null>(null)
    const {seller, isLoading: sellerLoading} = useSeller()

    const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
    const queryClient = useQueryClient()

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [message, setMessage] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    const {ws} = useWebSocket()

    const conversationId = searchParams.get("conversationId");

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const container = messageContainerRef.current
                if(container){
                    container.scrollTop = container.scrollHeight
                }
            }, 50)
        })
    }

    const handleSend = async (e: any) => {
        e.preventDefault()
        if(!message.trim() || !selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return

        const payload = {
            fromUserId: seller?.id,
            toUserId: selectedChat?.user?.id,
            conversationId: selectedChat?.conversationId,
            messageBody: message,
            senderType: "seller",
        }

        ws?.send(JSON.stringify(payload))

        setMessage("")
        scrollToBottom()
    }

    const handleChatSelect = (chat: any) => {
        setHasFetchedOnce(false)
        setChats((prev) =>
            prev.map((c) => c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c)
        )
        router.push(`?conversationId=${chat.conversationId}`)

        if(ws && ws.readyState === WebSocket.OPEN){
            ws?.send(JSON.stringify({
                type: "MARK_AS_SEEN",
                conversationId: chat.conversationId,    
            }))
        }
    }

    const { data: messages = [] } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOnce) return []
            const res = await axiosInstance.get(`/chatting/api/get-seller-messages/${conversationId}?page=1`)
            setPage(1)
            setHasMore(res.data.hasMore)
            setHasFetchedOnce(true)
            return res.data.messages.reverse()
        },
        enabled: !!conversationId,
        staleTime: 2 * 60 * 1000
    })

    const loadMoreMessages = async () => {
        const nextPage = page + 1;
        const res = await axiosInstance.get(`/chatting/api/get-seller-messages/${conversationId}?page=${nextPage}`)
        queryClient.setQueryData(["messages", conversationId], (old: any[]) => [
            ...res.data.messages.reverse(),
            ...old
        ])
        setPage(nextPage)
        setHasMore(res.data.hasMore)
    }

    const { data: conversations, isLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await axiosInstance.get("/chatting/api/get-seller-conversations")
            return res.data.conversations
        }
    })

    useEffect(() => {
        if(!conversationId || messages.length === 0) return
        const timeout = setTimeout(scrollToBottom, 100)
        return () => clearTimeout(timeout)
    }, [conversationId, messages.length])

    useEffect(() => {
        if (conversations) setChats(conversations)
    }, [conversations])

    useEffect(() => {
        if(!ws) return

        ws.onmessage = (event:any) => {
            const data = JSON.parse(event.data)

            if(data.type === "NEW_MESSAGE"){
                const newMsg = data?.payload

                if(newMsg.conversationId === conversationId){
                    queryClient.setQueryData(["messages", conversationId], 
                        (old:any = []) => [
                            ...old,
                            {
                                content: newMsg.messageBody || newMsg.content || "",
                                senderType: newMsg.senderType,
                                seen: false,
                                createdAt: newMsg.createdAt || new Date().toISOString()
                            }
                        ]
                    )   
                    scrollToBottom()
                }

                setChats((prev) =>
                    prev.map((c) => c.conversationId === newMsg.conversationId ? { ...c, lastMessage: newMsg.content } : c)
                )
            }

            if(data.type === "UNSEEN_COUNT_UPDATE"){
                const { conversationId, count } = data.payload
                setChats((prev) =>
                    prev.map((c) => c.conversationId === conversationId ? { ...c, unreadCount: count } : c)
                )
            }
        }
    }, [ws, conversationId])

    useEffect(() => {
        if (conversationId && chats.length > 0) {
            const chat = chats.find((c) => c.conversationId === conversationId)
            setSelectedChat(chat || null)
        }
    }, [conversationId, chats])

    return (
        <div className='w-full'>
            <div className='flex h-screen shadow-inner overflow-hidden bg-gray-950 text-white'>
                <div className='w-[320px] border-r border-gray-800 bg-gray-950'>
                    <div className='p-4 border-b border-b-gray-800 text-lg font-semibold'>
                        Messages
                    </div>

                    <div className='divide-y divide-gray-900'>
                        {isLoading ? (
                            <div className='py-5 text-sm text-center'>Loading...</div>
                        ) : chats.length === 0 ? (  
                            <p className='py-5 text-sm text-center  '>No conversations.</p>
                        ) : (
                            chats.map((chat) => {
                                const isActive = selectedChat?.conversationId === chat.conversationId;
                                return (
                                    <button
                                        onClick={() => handleChatSelect(chat)}
                                        key={chat.conversationId}
                                        className={`w-full text-left px-4 py-3 transition ${isActive ? "bg-blue-950" : "hover:bg-gray-800"}`}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Image
                                                src={chat?.user?.avatar || "https://ik.imagekit.io/tgk87wamq/default-image.jpg?updatedAt=1770815145635"}
                                                alt={chat?.user?.name}
                                                width={40} 
                                                height={40}
                                                className='rounded-full border w-[40px] h-[40px] object-cover'
                                            />
                                            <div className='flex-1'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-sm font-semibold text-white'>
                                                        {chat?.user?.name}
                                                    </span>
                                                    {chat?.user?.isOnline && (
                                                        <span className='w-2 h-2 rounded-full bg-green-500' />
                                                    )}
                                                </div>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-xs text-gray-500 truncate max-w-[170px]'>
                                                        {chat.lastMessage || ""}{" "}
                                                    </p>
                                                    {chat?.unreadCount > 0 && (
                                                        <span className='ml-2 text-[10px] bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center'>
                                                            {chat?.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className='flex flex-col flex-1 bg-gray-950'>
                    {selectedChat ? (
                        <>
                            {/* header stays white */}
                            <div className='p-4 border-b border-b-gray-800 bg-gray-900 flex items-center gap-3'>
                                <Image
                                    src={selectedChat.user?.avatar || "https://ik.imagekit.io/tgk87wamq/default-image.jpg?updatedAt=1770815145635"}
                                    alt={selectedChat?.user?.name}
                                    height={40}
                                    width={40}
                                    className='rounded-full border w-[40px] h-[40px] object-cover border-gray-500'
                                />
                                <div>
                                    <h2 className='text-gray-200 font-semibold text-base'>
                                        {selectedChat.user?.name}
                                    </h2>
                                    <p className='text-xs text-gray-500'>
                                        {selectedChat.user?.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>

                            {/* pale-grey message area — fills remaining space and scrolls */}
                            <div
                                ref={messageContainerRef}
                                className='flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm'
                            >
                                {hasMore && (
                                    <div className='flex justify-center mb-2'>
                                        <button className='text-xs text-gray-200 px-4 py-1 bg-gray-800 hover:bg-gray-900 rounded-md' onClick={loadMoreMessages}>
                                            Load Previous Messages
                                        </button>
                                    </div>
                                )}

                                {messages.map((msg: any, index: number) => (
                                    <div key={index} className={`flex flex-col ${msg.senderType === "seller" ? "items-end ml-auto" : "items-start"} max-w-[80%]`}>
                                        <div className={`${msg.senderType === "seller" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200"} px-4 py-2 rounded-lg shadow-sm w-fit`}>
                                            {msg.text || msg.content}
                                        </div>
                                        <div className={`text-[11px] text-gray-400 mt-1 flex items-center ${msg.senderType === "seller" ? "mr-1 justify-end" : "ml-1"}`}>
                                            {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                ))}

                                <div ref={scrollAnchorRef} />
                            </div>

                            {/* input stays fixed after message area */}
                            <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSend} />
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center text-gray-500 text-sm'>
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default page