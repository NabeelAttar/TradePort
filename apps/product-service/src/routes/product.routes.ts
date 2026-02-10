import express, { Router } from "express";
import { createDiscountCode, deleteDiscountCode, getCategories, getDiscountCodes } from "../controllers/product.controller";
import isAuthenticated from "@packages/middlewares/isAuthenticated";

const router:Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);

export default router