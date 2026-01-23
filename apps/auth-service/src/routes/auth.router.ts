import express, { Router } from "express";
import { getUser, loginUser, refreshToken, resetUserPassword, userForgotPassword, userRegistration, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middlewares/isAuthenticated";

const router:Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifyUser)
router.post("/login-user", loginUser)
router.post("/refresh-token-user", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/forgot-password-user", userForgotPassword)
router.post("/verify-forgot-password-user", verifyUserForgotPassword)
router.post("/reset-password-user", resetUserPassword)

export default router
