import { parseAsString, useQueryStates } from "nuqs";

export const useProductFilters = () => { // works exactly like useState but state lives in the URL (e.g., ?minPrice=10&maxPrice=100)
    return useQueryStates({
        minPrice: parseAsString
            .withOptions({
                clearOnDefault: true, // removes the param from URL when value is null/empty 
            }),
        maxPrice: parseAsString
            .withOptions({
                clearOnDefault: true,
            }),
    });
};
