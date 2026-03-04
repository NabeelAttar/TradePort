import { isAdmin } from "@packages/middlewares/authorizedRoles";
import isAuthenticated from "@packages/middlewares/isAuthenticated";
import express, { Router } from "express";
import { addCategory, addNewAdmin, addSubCategory, banUser, getAllAdmins, getAllCUstomizations, getALlEvents, getAllProducts, getAllSellers, getAllUsers, getDeviceUsageAnalytics, updateSiteAsset, uploadSiteAsset } from "../controllers/admin.controllers";

const router: Router = express.Router()

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts)
router.get("/get-all-events", isAuthenticated, isAdmin, getALlEvents)
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins)
router.put("/add-new-admin", isAuthenticated, isAdmin, addNewAdmin)
router.get("/get-all-customizations", getAllCUstomizations)
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers)
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers)

router.get("/device-usage", isAuthenticated, isAdmin, getDeviceUsageAnalytics);
router.put("/ban-user/:id", isAuthenticated, isAdmin, banUser);
router.post("/add-category", isAuthenticated, isAdmin, addCategory);
router.post("/add-subcategory", isAuthenticated, isAdmin, addSubCategory);
router.put("/update-site-asset", isAuthenticated, isAdmin, updateSiteAsset);
router.post("/upload-site-asset", isAuthenticated, isAdmin, uploadSiteAsset);

export default router