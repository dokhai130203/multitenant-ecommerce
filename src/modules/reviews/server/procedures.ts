import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const reviewsRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input
            (z.object({
                productId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const product = await ctx.db.findByID({ // confirms the product actually exists. You don't want to query reviews for a ghost product.
                collection: "products",
                id: input.productId,
            });

            if(!product) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Product not found",
                });
            }

            const reviewData = await ctx.db.find({ // Finds a review matching both — this product AND this logged-in user, without AND you'd find any review for the product, not just yours.
                collection: "reviews",
                limit: 1, // one review per user per product
                where: {
                    and: [
                        {
                            product: { equals: product.id },
                        },
                        {
                            user: { equals: ctx.session.user.id },
                        },
                    ],
                },
            });

            const review = reviewData.docs[0];

            if(!review) return null;

            return review;
        }),
        create: protectedProcedure // flow: user submit review form -> call this procedure -> check if product exists -> check if user already reviewed -> not yet -> create review
            .input(
                z.object({
                    productId: z.string(),
                    rating: z.number().min(1, { message: "Rating is required" }).max(5),
                    description: z.string().min(1, { message: "Description is required" }),
                })
            )
            .mutation(async ({ input, ctx }) => {
                const product = await ctx.db.findByID({
                    collection: "products",
                    id: input.productId,
                });

                if(!product) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Product not found",
                    });
                }

                const existingReviewsData = await ctx.db.find({
                    collection: "reviews",
                    where: {
                        and: [
                            {
                                product: { equals: product.id },
                            },
                            {
                                user: { equals: ctx.session.user.id },
                            },
                        ],
                    },
                });

                if(existingReviewsData.totalDocs > 0) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "You have already reviewed this product",
                    });
                }

                const review = await ctx.db.create({
                    collection: "reviews",
                    data: {
                        user: ctx.session.user.id,
                        product: product.id,
                        rating: input.rating,
                        description: input.description,
                    },
                });

                return review;
            }),
        update: protectedProcedure
            .input(
                z.object({
                    reviewId: z.string(),
                    rating: z.number().min(1, { message: "Rating is required" }).max(5),
                    description: z.string().min(1, { message: "Description is required" }),
                })
            )
            .mutation(async ({ input, ctx }) => {
                const existingReview = await ctx.db.findByID({
                    depth: 0, // existingReview.user will be the user ID
                    collection: "reviews",
                    id: input.reviewId,
                });

                if(!existingReview) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Review not found",
                    });
                }

                if(existingReview.user !== ctx.session.user.id) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You are not allowed to update this review",
                    });
                }
                
                const updatedReview = await ctx.db.update({
                    collection: "reviews",
                    id: input.reviewId,
                    data: {
                        rating: input.rating,
                        description: input.description,
                    },
                });

                return updatedReview;
            }),
});
