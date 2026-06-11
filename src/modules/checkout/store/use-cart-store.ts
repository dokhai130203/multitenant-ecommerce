import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TenantCart {
    productIds: string[]; // Tenant Cart └── list of product IDs
};

interface CartState { // State = data in the wardrobe
    tenantCarts: Record<string, TenantCart>; //key: [tenantSlug]: value TenantCart
    addProduct: (tenantSlug: string, productId: string) => void; // action
    removeProduct: (tenantSlug: string, productId: string) => void;
    clearCart: (tenantSlug: string) => void;
    clearAllCarts: () => void;
};

export const useCartStore = create<CartState>()( // Store = A common wardrobe for the entire app
    persist( // remember after refresh
       (set) => ({ // // set and get are functions to update and access the state
            tenantCarts: {}, // initial state
            addProduct: (tenantSlug, productId) => 
                set((state) => ({
                    tenantCarts: {
                        ...state.tenantCarts, // keep existing carts
                        [tenantSlug]: {
                            productIds: [ // create a new cart for the tenant
                                ...(state.tenantCarts[tenantSlug]?.productIds || []), // if tenant cart exists, keep existing productIds, otherwise start with an empty array
                                productId, // immutable update
                            ]
                        },
                    },
                })),
            removeProduct: (tenantSlug, productId) => 
                set((state) => ({
                    tenantCarts: {
                        ...state.tenantCarts,
                        [tenantSlug]: {
                            productIds: state.tenantCarts[tenantSlug]?.productIds.filter(
                                (id) => id !== productId
                            ) || [],
                        },
                    },
                })),
            clearCart: (tenantSlug) => 
                set((state) => ({
                    tenantCarts: {
                        ...state.tenantCarts,
                        [tenantSlug]: {
                            productIds: []
                        },
                    },
                })),
            clearAllCarts: () =>
                set({
                    tenantCarts: {},
                }),
        }),
       {
        name: "funroad-cart",
        storage: createJSONStorage(() => localStorage), // use localStorage to persist the cart
       },
    ),
);
