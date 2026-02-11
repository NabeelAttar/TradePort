import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

// get product categories
export const getCategories = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if(!config){
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
export const createDiscountCode = async(req: any, res:Response, next:NextFunction) => {
    try {
        const {public_name, discountType, discountValue, discountCode} = req.body;

        const doesDiscountCodeExist = await prisma.discount_codes.findUnique({where: {discountCode}});
        if(doesDiscountCodeExist){
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
export const getDiscountCodes = async(req: any, res: Response, next:NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({where: {sellerId: req.seller.id}});
        
        return res.status(201).json({
            success: true,
            discount_codes,
        }) 

    } catch (error) {
        return next(error);
    }
}

// delete discount code
export const deleteDiscountCode = async(req: any, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        const sellerId = req.seller.id;

        const discountCode = await prisma.discount_codes.findUnique({
            where: {id},
            select: { id: true, sellerId: true },
        })

        if(!discountCode){
            return next(new NotFoundError("Discount code Not Found"));
        }

        if(discountCode.sellerId !== sellerId){
            return next(new ValidationError("Unauthorized access!"));
        }

        await prisma.discount_codes.delete({where: {id}});

        return res.status(200).json({
            message: "Discount code successfully deleted."
        })
    } catch (error) {
        return next(error);
    }
}

// upload product image
export const uploadProductImage = async(req:Request, res:Response, next: NextFunction) => {
    try {
        const {fileName} = req.body;
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
export const deleteProductImage = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileId} = req.body;

        const response = await imagekit.deleteFile(fileId);

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        return next(error);
    }
}

export const createProduct = async(req:any, res:Response, next:NextFunction) => {
    try {
        const {title, short_description, detailed_description, warranty, custom_specifications, slug, tags, cash_on_delivery, brand, video_url, category, colors =[], sizes =[], discountCodes, stock, sale_price, regular_price, subCategory, custom_properties=[], images=[]} = req.body;
        if(!title || !slug || !short_description || !category || !subCategory || !sale_price || !images || !tags || !stock || !regular_price){
            return next(new ValidationError("MIssing required Fields"));
        }

        if(!req.seller.id) {
            return next(new AuthError("Only seller can create Products."));
        }

        const slugChecking = await prisma.products.findUnique({where: {slug}})
        if(slugChecking){
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
                images: {
                    create: images
                    .filter((image:any) => image && image.fileId && image.file_url)
                    .map((image:any) => ({
                        file_id: image.fileId,
                        url: image.file_url,
                    })),
                }
            },
            include: {images: true},
        })

        res.status(201).json({
            success: true,
            newProduct
        })

    } catch (error) {
        return next(error)
    }
}