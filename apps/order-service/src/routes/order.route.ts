import isAuthenticated from "@packages/middlewares/isAuthenticated";
import express, {Router} from "express"
import { createPaymentSession, createRazorpayOrder, verifyPaymentSession, verifyRazorpayPayment,  } from "../controllers/order.controller";

const router:Router = express.Router();

router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verifying-payment-session", isAuthenticated, verifyPaymentSession);
router.post("/create-razorpay-order", isAuthenticated, createRazorpayOrder);
router.post("/verify-razorpay-payment", isAuthenticated, verifyRazorpayPayment);

export default router