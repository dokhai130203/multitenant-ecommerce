import z from "zod";
import type { Where } from "payload";

import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input
            (z.object({
                category: z.string().nullable().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const where: Where = {}; // empty = "no filters, get all products"

            if(input.category) { // 
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
                        // Because of "depth: 1", these are fully populated Category objects
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
                }
                
                where["category.slug"] = {
                    in: [parentCategory.slug, ...subcategoriesSlugs]
                }
            }
            const data = await ctx.db.find({
                collection: "products",
                depth: 1, // populate "category" & "image"
                where,
            });

            return data;
        }),
});
