import { ValidationError } from "@packages/error-handler";
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
                    }
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
            categories: config?.categories || [],
            subCategories: config?.subCategories || [],
            logo: config?.logo || null,
            banner: config?.banner || null
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
                    // role: true,
                    createdAt: true,
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
        // Get user analytics data
        const userAnalytics = await prisma.userAnalytics.findMany({
            select: {
                device: true
            }
        });

        // Count devices
        const deviceCounts = userAnalytics.reduce((acc: any, analytics) => {
            const device = analytics.device || 'Unknown';
            acc[device] = (acc[device] || 0) + 1;
            return acc;
        }, {});

        const totalDevices = Object.values(deviceCounts).reduce((sum: number, count: any) => sum + count, 0);

        // Format data for chart
        const deviceData = [
            { name: "Desktop", value: Math.round((deviceCounts['Desktop'] || 0) / totalDevices * 100), color: "#3b82f6" },
            { name: "Mobile", value: Math.round((deviceCounts['Mobile'] || 0) / totalDevices * 100), color: "#22c55e" },
            { name: "Tablet", value: Math.round((deviceCounts['Tablet'] || 0) / totalDevices * 100), color: "#eab308" },
        ].filter(item => item.value > 0);

        res.status(200).json({
            success: true,
            data: deviceData
        });
    } catch (error) {
        return next(error);
    }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const months = parseInt(req.query.months as string) || 6;
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const orders = await prisma.orders.findMany({
            where: {
                createdAt: {
                    gte: startDate
                },
                status: 'Paid'
            },
            select: {
                total: true,
                createdAt: true
            }
        });

        // Group by month
        const monthlyData = orders.reduce((acc: any, order) => {
            const date = new Date(order.createdAt);
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            if (!acc[monthName]) {
                acc[monthName] = { month: monthName, revenue: 0, orders: 0 };
            }
            
            acc[monthName].revenue += order.total || 0;
            acc[monthName].orders += 1;
            
            return acc;
        }, {});

        const chartData = Object.values(monthlyData);

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        return next(error);
    }
};

// Get geographical analytics
export const getGeographicalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [userAnalytics, totalUsers, totalSellers] = await Promise.all([
            prisma.userAnalytics.findMany({
                select: {
                    country: true,
                    city: true
                }
            }),
            prisma.users.count(),
            prisma.sellers.count()
        ]);

        // Group by country
        const countryCounts = userAnalytics.reduce((acc: any, analytics) => {
            const country = analytics.country || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});

        // Get top countries
        const topCountries = Object.entries(countryCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 8)
            .map(([country, users]) => ({
                country,
                users: users as number,
                sellers: Math.round(Math.random() * totalSellers * 0.3) // Simplified - in real app, track seller locations
            }));

        res.status(200).json({
            success: true,
            data: {
                countries: topCountries,
                totalUsers,
                totalSellers
            }
        });
    } catch (error) {
        return next(error);
    }
};

// Get dashboard overview stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalUsers,
            totalSellers,
            totalOrders,
            totalRevenue,
            recentOrders,
            topProducts
        ] = await Promise.all([
            prisma.users.count(),
            prisma.sellers.count(),
            prisma.orders.count(),
            prisma.orders.aggregate({
                _sum: { total: true }
            }),
            prisma.orders.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true }
                    }
                }
            }),
            prisma.products.findMany({
                take: 5,
                orderBy: { totalSales: 'desc' },
                select: {
                    title: true,
                    totalSales: true,
                    sale_price: true
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalOrders,
                totalRevenue: totalRevenue._sum.total || 0,
                recentOrders,
                topProducts
            }
        });
    } catch (error) {
        return next(error);
    }
};