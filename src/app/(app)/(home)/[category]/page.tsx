import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
    params: Promise<{
        category: string;
    }>,
    searchParams: Promise<SearchParams>;
};

export const dynamic = "force-dynamic";

const Page = async ({ params, searchParams }: Props) => {
    const { category } = await params; // get category from url params (e.g. /electronics -> category: "electronics")
    const filters = await loadProductFilters(searchParams); // get filters from url search params (e.g. ?minPrice=10&maxPrice=100 -> filters: { minPrice: "10", maxPrice: "100" })

    const queryClient = getQueryClient();
    void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ 
        ...filters,
        category,
        limit: DEFAULT_LIMIT,
    }));
    
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListView category={category} />
        </HydrationBoundary>
    );
};

export default Page;
