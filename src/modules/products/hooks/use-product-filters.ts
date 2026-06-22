import { useQueryStates, parseAsString, parseAsArrayOf, parseAsStringLiteral } from "nuqs";

const sortValues = ["curated", "trending", "hot_and_new"] as const;

const params = {
    search: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),
    sort: parseAsStringLiteral(sortValues).withDefault("curated"),
    minPrice: parseAsString
        .withOptions({
            clearOnDefault: true, // removes the param from URL when value is null/empty 
        })
        .withDefault(""),
    maxPrice: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),
    tags: parseAsArrayOf(parseAsString)
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault([]),
};

export const useProductFilters = () => { // works exactly like useState but state lives in the URL (e.g., ?minPrice=10&maxPrice=100)
    return useQueryStates(params);
};
