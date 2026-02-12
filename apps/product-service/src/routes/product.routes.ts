import express, { Router } from "express";
import { createDiscountCode, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllProducts, getCategories, getDiscountCodes, getShopProducts, restoreProduct, uploadProductImage } from "../controllers/product.controller";
import isAuthenticated from "@packages/middlewares/isAuthenticated";

const router:Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
router.get("/get-all-products", getAllProducts);

export default router