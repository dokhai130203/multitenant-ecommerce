import z from "zod";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { sortValues } from "../search-params";

export const productsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input}) => {
            const headers = await getHeaders();
            const session = await ctx.db.auth({ headers });

            const product = await ctx.db.findByID({
                collection: "products",
                id: input.id,
                depth: 2, // populate "product.image", "product.tenant" & "product.tenant.image"
            });

            let isPurchased = false;

            if(session.user) {
                const ordersData = await ctx.db.find({
                    collection: "orders",
                    pagination: false,
                    limit: 1,
                    where: {
                        and: [
                            {
                                product: {
                                    equals: input.id,
                                },
                            },
                            {
                                user: {
                                    equals: session.user.id,
                                },
                            },
                        ],
                    },
                });

                isPurchased = !!ordersData.docs[0]; // explain: if ordersData.docs[0] exists, it means the user has purchased the product, so isPurchased = true, otherwise false
            }

            return {
                ...product,
                isPurchased,
                image: product.image as Media | null,
                tenant: product.tenant as Tenant & { image: Media | null },
            }
        }),
        
    getMany: baseProcedure
        .input
            (z.object({
                cursor: z.number().default(1),
                limit: z.number().default(DEFAULT_LIMIT),
                category: z.string().nullable().optional(),
                minPrice: z.string().nullable().optional(),
                maxPrice: z.string().nullable().optional(),
                tags: z.array(z.string()).nullable().optional(),
                sort: z.enum(sortValues).nullable().optional(),
                tenantSlug: z.string().nullable().optional(),
            }),
        )
        .query(async ({ ctx, input }) => { // define the procedure
            const where: Where = {}; // empty = "no filters, get all products"
            let sort: Sort = "-createdAt"; // default sort

            if(input.sort === "curated") {
                sort = "-createdAt";
            }

            if(input.sort === "hot_and_new") {
                sort = "+createdAt";
            }

            if(input.sort === "trending") {
                sort = "-createdAt";
            }

            if(input.minPrice && input.maxPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                    less_than_equal: input.maxPrice,
                }
            } else if (input.minPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                }
            } else if (input.maxPrice) {
                where.price = {
                    less_than_equal: input.maxPrice,
                }
            }

            if(input.tenantSlug) {
                where["tenant.slug"] = {
                    equals: input.tenantSlug,
                };
            }

            if(input.category) {
                const categoriesData = await ctx.db.find({
                    collection: "categories",
                    limit: 1,
                    depth: 1, // populate subcategories one level deep, subcategories.[0] will be a type of "Category"
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        }
                    }
                });

                const formattedData = categoriesData.docs.map((doc) => ({
                    ...doc,
                    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                        // Because of "depth: 1", we are confident "doc" will be a type of "Category"
                        ...(doc as Category),
                        subcategories: undefined,
                    }))
                }));

                const subcategoriesSlugs = [];
                const parentCategory = formattedData[0];

                if(parentCategory) {
                    subcategoriesSlugs.push(
                        ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
                    )
                    
                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategoriesSlugs]
                    }
                }
            }

            if(input.tags && input.tags.length > 0) {
                where["tags.name"] = {
                    in: input.tags,
                };
            }

            const data = await ctx.db.find({
                collection: "products",
                depth: 2, // populate "category", "image", "tenant" & "tenant.image"
                where,
                sort,
                page: input.cursor,
                limit: input.limit,
            });

            return {
                ...data,
                docs: data.docs.map((doc) => ({
                    ...doc,
                    image: doc.image as Media | null,
                    tenant: doc.tenant as Tenant & { image: Media | null },
                }))
            }
        }),
});
