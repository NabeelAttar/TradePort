'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from 'apps/user-ui/src/context/webSocketContext'
import useRequireAuth from 'apps/user-ui/src/hooks/useRequiredAuth'
import ChatInput from 'apps/user-ui/src/shared/components/ChatInput'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { isProtected } from 'apps/user-ui/src/utils/protected'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const page = () => {
    const searchParams = useSearchParams()
    const { user, isLoading: userLoading } = useRequireAuth()
    const router = useRouter()
    const messageContainerRef = useRef<HTMLDivElement | null>(null)
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
    const queryClient = useQueryClient()

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [message, setMessage] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    const {ws, unreadCounts} = useWebSocket()

    const conversationId = searchParams.get("conversationId");

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                scrollAnchorRef.current?.scrollIntoView({ behavior : "smooth"})
            }, 0)
        })
    }

    const handleSend = async (e: any) => {
        e.preventDefault()
        if(!message.trim() || !selectedChat) return

        const payload = {
            fromUserId: user?.id,
            toUserId: selectedChat?.seller?.id,
            conversationId: selectedChat?.conversationId,
            messageBody: message,
            senderType: "user",
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

        ws?.send(JSON.stringify({
            type: "MARK_AS_SEEN",
            conversationId: chat.conversationId,    
        }))
    }

    const { data: messages = [] } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOnce) return []
            const res = await axiosInstance.get(`/chatting/api/get-user-messages/${conversationId}?page=1`, isProtected)
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
        const res = await axiosInstance.get(`/chatting/api/get-user-messages/${conversationId}?page=${nextPage}`, isProtected)
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
            const res = await axiosInstance.get("/chatting/api/get-user-conversations", isProtected)
            return res.data.conversations
        }
    })

    useEffect(() => {
        if (conversations) setChats(conversations)
    }, [conversations])

    useEffect(() => {
        if(messages?.length > 0) scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (conversationId && chats.length > 0) {
            const chat = chats.find((c) => c.conversationId === conversationId)
            setSelectedChat(chat || null)
        }
    }, [conversationId, chats])

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

    return (
        <div className='w-full bg-gray-100 h-screen overflow-hidden'>
            <div className='md:w-[80%] mx-auto pt-5 h-full'>
                {/* outer wrapper unchanged */}
                <div className='flex h-[95vh] shadow-sm overflow-hidden  bg-white rounded-md'>
                    {/* LEFT LIST */}
                    <div className='w-[320px] border-r border-r-gray-200 bg-gray-50 h-full'>
                        <div className='p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800'>
                            Messages
                        </div>

                        {/* keep divide-y if you want separators */}
                        <div className='divide-y divide-gray-200 h-full overflow-y-auto'>
                            {isLoading ? (
                                <div className='p-4 text-sm text-gray-500'>Loading...</div>
                            ) : chats.length === 0 ? (
                                <div className='p-4 text-sm text-gray-500'>No conversations.</div>
                            ) : (
                                chats.map((chat) => {
                                    const isActive = selectedChat?.conversationId === chat.conversationId;
                                    return (
                                        <button
                                            onClick={() => handleChatSelect(chat)}
                                            key={chat.conversationId}
                                            className={`w-full text-left px-4 py-3 transition flex items-center gap-3 ${isActive ? "bg-blue-50 border-r-4 border-r-blue-500" : "hover:bg-blue-50"}`}
                                        >
                                            <Image
                                                src={chat?.seller?.avatar || "https://ik.imagekit.io/tgk87wamq/default-image.jpg?updatedAt=1770815145635"}
                                                alt={chat?.seller?.name}
                                                width={40}
                                                height={40}
                                                className='rounded-full border w-[40px] h-[40px] object-cover'
                                            />
                                            <div className='flex-1'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-sm font-semibold text-gray-800'>
                                                        {chat?.seller?.name}
                                                    </span>
                                                    {chat?.seller?.isOnline && (
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
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT / MAIN CHAT COLUMN */}
                    {/* IMPORTANT: min-h-0 so flex children can shrink and scroll correctly */}
                    <div className='flex flex-col flex-1 bg-gray-100 min-h-0'>
                        {selectedChat ? (
                            <>
                                {/* header stays white */}
                                <div className='p-4 border-b border-b-gray-200 bg-white flex items-center gap-3'>
                                    <Image
                                        src={selectedChat.seller?.avatar || "https://ik.imagekit.io/tgk87wamq/default-image.jpg?updatedAt=1770815145635"}
                                        alt={selectedChat?.seller?.name}
                                        height={40}
                                        width={40}
                                        className='rounded-full border w-[40px] h-[40px] object-cover border-gray-200'
                                    />
                                    <div>
                                        <h2 className='text-gray-800 font-semibold text-base'>
                                            {selectedChat.seller?.name}
                                        </h2>
                                        <p className='text-xs text-gray-500'>
                                            {selectedChat.seller?.isOnline ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                {/* pale-grey message area — fills remaining space and scrolls */}
                                <div
                                    ref={messageContainerRef}
                                    className='flex-1 overflow-y-auto px-6 py-6 text-sm bg-[#f4f6f7] min-h-0'
                                >
                                    {hasMore && (
                                        <div className='flex justify-center mb-2'>
                                            <button className='text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300' onClick={loadMoreMessages}>
                                                Load Previous Messages
                                            </button>
                                        </div>
                                    )}

                                    {messages.map((msg: any, index: number) => (
                                        <div key={index} className={`flex flex-col ${msg.senderType === "user" ? "items-end ml-auto" : "items-start"} max-w-[80%]`}>
                                            <div className={`${msg.senderType === "user" ? "bg-blue-600 text-white" : "text-gray-800 bg-white"} px-4 py-2 rounded-lg shadow-sm w-fit`}>
                                                {msg.text || msg.content}
                                            </div>
                                            <div className={`text-[11px] text-gray-400 mt-1 flex items-center ${msg.senderType === "user" ? "mr-1 justify-end" : "ml-1"}`}>
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
                            <div className='flex-1 flex items-center justify-center text-gray-400 text-sm'>
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page