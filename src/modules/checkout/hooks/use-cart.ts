import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {
    const addProduct = useCartStore((state) => state.addProduct); // take action from the store
    const removeProduct = useCartStore((state) => state.removeProduct);
    const clearCart = useCartStore((state) => state.clearCart);
    const clearAllCarts = useCartStore((state) => state.clearAllCarts);

    const productIds = useCartStore(useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || [])); // use shallow comparison to prevent unnecessary re-renders when other tenant carts are updated (e.g. when adding a product to another tenant's cart, ["A", "B"] & ["A", "B"], A = A, B = B => the same => no re-render)

    const toggleProduct = useCallback((productId: string) => { // useCallback to memoize the function and prevent unnecessary re-renders, prevent recreate of the function
        if(productIds.includes(productId)) {
            removeProduct(tenantSlug, productId);
        } else {
            addProduct(tenantSlug, productId);
        }
    }, [addProduct, removeProduct, productIds, tenantSlug]);

    const isProductInCart = useCallback((productId: string) => {
        return productIds.includes(productId);
    }, [productIds]);

    const clearTenantCart = useCallback(() => {
        clearCart(tenantSlug);
    }, [tenantSlug, clearCart]);

    const handleAddProduct = useCallback((productId: string) => {
        addProduct(tenantSlug, productId);
    }, [addProduct, tenantSlug]);

    const handleRemoveProduct = useCallback((productId: string) => {
        removeProduct(tenantSlug, productId);
    }, [removeProduct, tenantSlug]);

    return {
        productIds,
        addProduct: handleAddProduct,
        removeProduct: handleRemoveProduct,
        clearCart: clearTenantCart,
        clearAllCarts,
        toggleProduct,
        isProductInCart,
        totalItems: productIds.length,
    };
};
