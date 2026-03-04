import { AuthError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

// get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    starting_date: null
                },
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: { url: true},
                        take: 1
                    },
                    Shop: {
                        select: { name : true }
                    }
                }
            }),
            prisma.products.count({
                where: {
                    starting_date: null
                }
            })
        ])

        const totalPages = Math.ceil(totalProducts / limit)

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        })

    } catch (error) {
        return next(error)
    }
}

// get all events
export const getALlEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    starting_date: { not: null}
                },
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: { url: true},
                        take: 1
                    },
                    Shop: {
                        select: { name : true }
                    },
                    starting_date: true,
                    ending_date: true
                }
            }),
            prisma.products.count({
                where: {
                    starting_date: {not: null}
                }
            })
        ])

        const totalPages = Math.ceil(totalProducts / limit)

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        })

    } catch (error) {
        return next(error)
    }
}

// get all Admins
export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await prisma.users.findMany({
            where: {
                role: "admin"
            }
        })

        res.status(200).json({
            success: true,
            admins
        })
    } catch (error) {
        return next(error)
    }
}

export const addNewAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, role} = req.body
        if(!["admin", "user"].includes(role)){
            return next(new ValidationError("invalid role"))
        }
        
        const isUser = await prisma.users.findUnique({where: { email }})
        if(!isUser){
            return next(new ValidationError("this email isnt registered as a user"))
        }

        const updatedRole = await prisma.users.update({
            where: {email},
            data: {
                role
            }
        })

        res.status(201).json({
            success: true,
            updatedRole
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllCUstomizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();

        return res.status(200).json({
            categories: config?.categories || {},
            subCategories: config?.subCategories || {},
            logo: config?.logo || 'https://ik.imagekit.io/tgk87wamq/products/product-1771056257296_8kyU1OLVW.jpg?updatedAt=1771056259243',
            banner: config?.banner || 'https://ik.imagekit.io/tgk87wamq/products/Screenshot_2026-02-12_173149-removebg-preview.png?updatedAt=1770898486950'
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    isBanned: true,
                }
            }),
            prisma.users.count()
        ])

        const totalPages = Math.ceil(totalUsers / limit)

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages,
            }
        })

    } catch (error) {
        return next(error)
    }
}

export const getAllSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const [sellers, totalsellers] = await Promise.all([
            prisma.sellers.findMany({
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    shop: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            address: true
                        }
                    }
                }
            }),
            prisma.sellers.count()
        ])

        const totalPages = Math.ceil(totalsellers / limit)

        res.status(200).json({
            success: true,
            data: sellers,
            meta: {
                totalsellers,
                currentPage: page,
                totalPages,
            }
        })

    } catch (error) {
        return next(error)
    }
}

// Get device usage analytics
export const getDeviceUsageAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userAnalytics = await prisma.userAnalytics.findMany({
            select: { device: true }
        });
        console.log("UserAnalytics count:", userAnalytics.length);
console.log("UserAnalytics sample:", userAnalytics[0]);

        const deviceCounts = userAnalytics.reduce((acc: any, analytics) => {
            const rawDevice = analytics.device || '';
            const deviceType = rawDevice.split(' - ')[0]?.trim().toLowerCase() || 'unknown';
            acc[deviceType] = (acc[deviceType] || 0) + 1;
            return acc;
        }, {});

        const totalDevices = Object.values(deviceCounts)
            .reduce((sum: number, count: any) => sum + count, 0);

        if (totalDevices === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const normalizedNameMap: any = {
            mobile: "Mobile",
            desktop: "Desktop",
            tablet: "Tablet",
        };

        const deviceData = Object.entries(deviceCounts).map(([key, count]: any) => ({
            name: normalizedNameMap[key] || key,
            value: Math.round((count / totalDevices) * 100),
            color:
                key === "desktop"
                    ? "#3b82f6"
                    : key === "mobile"
                    ? "#22c55e"
                    : key === "tablet"
                    ? "#eab308"
                    : "#94a3b8",
        }));

        res.status(200).json({
            success: true,
            data: deviceData
        });
    } catch (error) {
        return next(error);
    }
};

export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return next(new ValidationError("User ID is required."));
    }

    const user = await prisma.users.findUnique({
      where: { id }
    });

    if (!user) {
      return next(new AuthError("User not found."));
    }

    if (user.role === "admin") {
      return next(new ValidationError("Admin users cannot be banned."));
    }

    if (user.isBanned) {
      return next(new ValidationError("User is already banned."));
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason || "Violation of platform policies"
      }
    });

    // Optional notification
    await prisma.notifications.create({
      data: {
        title: "Account Suspended",
        message: "Your account has been suspended by the platform admin.",
        creatorId: (req as any).user.id,
        receiverId: updatedUser.id,
      }
    });

    return res.status(200).json({
      success: true,
      message: "User banned successfully",
      user: updatedUser
    });

  } catch (error) {
    return next(error);
  }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { category } = req.body

    if (!category) {
      return res.status(400).json({ message: "Category required" })
    }

    const config = await prisma.site_config.findFirst()

    const updated = await prisma.site_config.update({
      where: { id: config!.id },
      data: {
        categories: {
          push: category
        }
      }
    })

    res.status(200).json({
      success: true,
      updated
    })

  } catch (error) {
    return next(error)
  }
}

export const addSubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { category, subCategory } = req.body

    const config = await prisma.site_config.findFirst()

    const subCategories: any = config?.subCategories || {}

    if (!subCategories[category]) {
      subCategories[category] = []
    }

    subCategories[category].push(subCategory)

    const updated = await prisma.site_config.update({
      where: { id: config!.id },
      data: {
        subCategories
      }
    })

    res.status(200).json({
      success: true,
      updated
    })

  } catch (error) {
    return next(error)
  }
}

export const uploadSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { file, type } = req.body

    if (!["logo", "banner"].includes(type)) {
      return res.status(400).json({ message: "Invalid upload type" })
    }

    const folder = type === "logo" ? "/site/logo" : "/site/banner"

    const response = await imagekit.upload({
      file,
      fileName: `${type}-${Date.now()}.jpg`,
      folder
    })

    return res.status(201).json({
      file_url: response.url,
      fileId: response.fileId
    })

  } catch (error) {
    return next(error)
  }
}

export const updateSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { type, url } = req.body

    const config = await prisma.site_config.findFirst()

    const updated = await prisma.site_config.update({
      where: { id: config!.id },
      data: {
        [type]: url
      }
    })

    return res.status(200).json({
      success: true,
      updated
    })

  } catch (error) {
    return next(error)
  }
}