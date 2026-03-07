import isAuthenticated from '@packages/middlewares/isAuthenticated'
import express from 'express'
import { fetchSellerMessages, fetchUserMessages, getSellerConversations, getUserConversations, newConversation } from '../controllers/chatting.controller'
import { isSeller } from '@packages/middlewares/authorizedRoles'

const router = express.Router()

router.post("/create-user-conversationGroup", isAuthenticated, newConversation)
router.get("/get-user-conversations", isAuthenticated, getUserConversations)
router.get("/get-seller-conversations", isAuthenticated, isSeller, getSellerConversations)
router.get("/get-user-messages/:conversationId", isAuthenticated, fetchUserMessages)
router.get("/get-seller-messages/:conversationId", isAuthenticated, isSeller, fetchSellerMessages)

export default router