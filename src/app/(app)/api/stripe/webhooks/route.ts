import type { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent( // stripe use body, signature and secret
            await (await req.blob()).text(), // Read the raw body as text
            req.headers.get("stripe-signature") as string, // verify the signature header
            process.env.STRIPE_WEBHOOK_SECRET as string, // use the webhook secret to verify the signature
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if(error! instanceof Error) {
            console.log(error);
        }
        
        console.log(`❌ Error message: ${errorMessage}`);
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 },
        )
    }

    console.log("✅ Success:", event.id);

    const permittedEvents: string[] = [
        "checkout.session.completed", // only listen to checkout session completed events
    ];

    const payload = await getPayload({ config }); // get the payload instance to interact with the database

    if(permittedEvents.includes(event.type)) { // only handle events that are in the permitted events list
        let data;

        try {
            switch (event.type) {
                case "checkout.session.completed":
                    data = event.data.object as Stripe.Checkout.Session;
                    
                    if(!data.metadata?.userId) {
                        throw new Error("User ID is required");
                    }

                    const user = await payload.findByID({
                        collection: "users",
                        id: data.metadata.userId,
                    });

                    if(!user) {
                        throw new Error("User not found");
                    }

                    const expandedSession = await stripe.checkout.sessions.retrieve( // retrieve the checkout session to get the line items
                        data.id,
                        {
                            expand: ["line_items.data.price.product"],
                        },
                    );

                    if(
                        !expandedSession.line_items?.data ||
                        !expandedSession.line_items.data.length
                    ) {
                        throw new Error("No line items found");
                    }

                    const lineItems = expandedSession.line_items.data as ExpandedLineItem[]; // TS will not recognize the expanded line items, so we need to cast it to our custom type

                    for(const item of lineItems) {
                       await payload.create({
                            collection: "orders",
                            data: {
                                stripeCheckoutSessionId: data.id,
                                user: user.id,
                                product: item.price.product.metadata.id,
                                name: item.price.product.name,
                            },
                       });
                    }
                    break;
                default:
                    throw new Error(`Unhandled event: ${event.type}`);
            }
        } catch (error) {
            console.log(error)
            return NextResponse.json(
                { message: "Webhook handler failed" },
                { status: 500 },
            );
        }
    }

    return NextResponse.json({ message: "Received" }, { status: 200 });
};
