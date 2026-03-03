import express, { Router } from "express";
import { createShop, createBankAccount, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, resetUserPassword, userForgotPassword, userRegistration, verifySeller, verifyUser, verifyUserForgotPassword, getUserAddresses, addUserAddress, deleteUserAddress, updateUserPassword, loginAdmin, getAdmin } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middlewares/isAuthenticated";
import { isAdmin, isSeller } from "@packages/middlewares/authorizedRoles";

const router:Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifyUser)
router.post("/login-user", loginUser)
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/forgot-password-user", userForgotPassword)
router.post("/verify-forgot-password-user", verifyUserForgotPassword)
router.post("/reset-password-user", resetUserPassword)
router.post("/change-password", isAuthenticated, updateUserPassword)
router.post('/login-admin', loginAdmin);
router.get("/logged-in-admin", isAuthenticated, isAdmin, getAdmin)

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-bank-account", createBankAccount);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

export default router
