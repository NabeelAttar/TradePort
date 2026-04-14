import isAuthenticated from "@packages/middlewares/isAuthenticated";
import express, { Router } from "express";
import { getRecommendedProducts } from "../controllers/recommendation.controllers";

const router: Router = express.Router()

router.get("/get-recommended-products", isAuthenticated, getRecommendedProducts)

export default router