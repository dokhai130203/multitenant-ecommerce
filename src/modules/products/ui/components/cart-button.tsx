import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
    tenantSlug: string;
    productId: string;
    isPurchased?: boolean;
    isOwner?: boolean;
};

export const CartButton = ({ tenantSlug, productId, isPurchased, isOwner }: Props) => {
    const cart = useCart(tenantSlug);

    if(isPurchased) {
        return (
            <Button variant="elevated" asChild className="w-full font-medium bg-white">
                <Link prefetch href={`/library/${productId}`}>
                    View in Library
                </Link>
            </Button>
        );
    }

    if(isOwner) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <Button variant="elevated" disabled className="w-full bg-white font-medium text-muted-foreground">
                    This is your Product
                </Button>
                <Button variant="elevated" asChild className="w-full bg-black text-white hover:bg-pink-400 hover:text-black font-medium">
                    <Link href={`/admin/collections/products/${productId}`}>
                        Edit Product
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="elevated"
            className={cn(
                "w-full font-medium",
                cart.isProductInCart(productId) ? "bg-white" : "bg-pink-400"
            )}
            onClick={() => cart.toggleProduct(productId)}
        > 
            {cart.isProductInCart(productId) ? "Remove from Cart" : "Add to Cart"}
        </Button>
    );
};
