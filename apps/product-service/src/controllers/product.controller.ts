import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

// get product categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if (!config) {
            return res.status(404).json({ message: "Categories Not Found." });
        }

        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories
        })
    } catch (error) {
        return next(error);
    }
}

// create discount codes
export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body;

        const doesDiscountCodeExist = await prisma.discount_codes.findUnique({ where: { discountCode } });
        if (doesDiscountCodeExist) {
            return next(new ValidationError("Discount code already in use. Please use a different discount code"));
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller.id,
            }
        })

        return res.status(200).json({
            success: true,
            discount_code,
        });

    } catch (error) {
        return next(error);
    }
}

// get discount codes
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({ where: { sellerId: req.seller.id } });

        return res.status(201).json({
            success: true,
            discount_codes,
        })

    } catch (error) {
        return next(error);
    }
}

// delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;

        const discountCode = await prisma.discount_codes.findUnique({
            where: { id },
            select: { id: true, sellerId: true },
        })

        if (!discountCode) {
            return next(new NotFoundError("Discount code Not Found"));
        }

        if (discountCode.sellerId !== sellerId) {
            return next(new ValidationError("Unauthorized access!"));
        }

        await prisma.discount_codes.delete({ where: { id } });

        return res.status(200).json({
            message: "Discount code successfully deleted."
        })
    } catch (error) {
        return next(error);
    }
}

// upload product image
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
        })

        res.status(201).json({
            file_url: response.url,
            fileId: response.fileId,
        })
    } catch (error) {
        return next(error);
    }
}

// delete product image
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;

        const response = await imagekit.deleteFile(fileId);

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        return next(error);
    }
}

// create product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { title, short_description, detailed_description, warranty, custom_specifications, slug, tags, cash_on_delivery, brand, video_url, category, colors = [], sizes = [], discountCodes, stock, sale_price, regular_price, subCategory, custom_properties = [], starting_date, ending_date, images = [] } = req.body;
        if (!title || !slug || !short_description || !category || !subCategory || !sale_price || !images || !tags || !stock || !regular_price) {
            return next(new ValidationError("MIssing required Fields"));
        }

        if (!req.seller.id) {
            return next(new AuthError("Only seller can create Products."));
        }

        const slugChecking = await prisma.products.findUnique({ where: { slug } })
        if (slugChecking) {
            return next(new ValidationError("Slug Already exists. Please use a different slug."))
        }

        const newProduct = await prisma.products.create({
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                cashOnDelivery: cash_on_delivery,
                slug,
                shopId: req.seller?.shop?.id,
                tags: Array.isArray(tags) ? tags : tags.split(","),
                brand,
                video_url,
                category,
                subCategory,
                colors: colors || [],
                discount_codes: discountCodes.map((codeId: string) => codeId),
                sizes: sizes || [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                custom_properties: custom_properties || {},
                custom_specifications: custom_specifications || {},
                starting_date: starting_date ? starting_date : null,
                ending_date: ending_date ? ending_date : null,
                images: {
                    create: images
                        .filter((image: any) => image && image.fileId && image.file_url)
                        .map((image: any) => ({
                            file_id: image.fileId,
                            url: image.file_url,
                        })),
                }
            },
            include: { images: true },
        })

        res.status(201).json({
            success: true,
            newProduct
        })

    } catch (error) {
        return next(error)
    }
}

// get logged in seller products
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                shopId: req?.seller?.shop?.id
            },
            include: {
                images: true
            },
        })

        res.status(201).json({
            success: true,
            products
        })

    } catch (error) {
        return next(error);
    }
}

// delete product
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        })
        if (!product) {
            return next(new ValidationError("Product not found."))
        }

        if (product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action."))
        }

        if (product.isDeleted) {
            return next(new ValidationError("Product is already deleted."))
        }

        const deletedProduct = await prisma.products.update({
            where: { id: productId },
            data: {
                isDeleted: true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        })

        return res.status(200).json({
            message: "Product is scheduled for deletion in 24 hours. You can restore it within this time.",
            deletedAt: deletedProduct.deletedAt,
        })

        // after this too the product will still be not deleted from the mongodb database, cuz we are not instantly deleting
        // we are deleting after 24 hours, thats why we will use chronjobs which lets us delete all products from the database
        // at a specific time of the day say midnight, so, at midnight for whatever products the deletedAt value will be less than 
        // Date.now() will be deleted from the database 

    } catch (error) {
        return next(error);
    }
}

// restore product
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        })
        if (!product) {
            return next(new ValidationError("Product not found."))
        }

        if (product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action."))
        }

        if (!product.isDeleted) {
            return res.status(400).json({
                message: "Product is not in deleted state."
            })
        }

        await prisma.products.update({
            where: { id: productId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        })

        return res.status(200).json({
            message: "Product successfully restored.",
        })

    } catch (error) {
        return next(error);
    }
}

// export const getStripeAccount

// get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // implementing serverside pagination - that is breaking large data into smaller pages
        // GET /products?page=2&limit=20&type=latest , everything after ? here, is req.query 
        // req.query = {
            // page: "2",
            // limit: "20",
            // type: "latest"
        // }
        // pagination is instead of loading 10000 products at once, load 20 products, so page signifies current page number
        //  if page = 1, display 0-20 , products on 1st page, if page = 2, skip = 20, hence show products 21-40 on page 2,
        // type is used for sorting , if type is not "latest" that is latest products then by default we are sorting products
        // by highest number of sales

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type;

        // in our database , products models also has events which has starting_date & ending_date , so if starting_date OR
        // ending_date is null then that is an actual real product, not an event
        const baseFilter = {
            OR: [
                {
                    starting_date: null,
                },
                {
                    ending_date: null
                }
            ]
        }

        const orderBy: Prisma.productsOrderByWithRelationInput =
            type === "latest"
                ? { createdAt: "desc" as Prisma.SortOrder }
                : { totalSales: "desc" as Prisma.SortOrder }

        // run 3 db queries in parallel - more efficient
        const [products, total, top10Products] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    Shop: true,
                },
                where: baseFilter,
                orderBy: {
                    totalSales: "desc",
                }
            }),
            prisma.products.count({ where: baseFilter }),
            prisma.products.findMany({
                take: 10,
                where: baseFilter,
                orderBy,
            })
        ])

        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return next(error);
    }
}