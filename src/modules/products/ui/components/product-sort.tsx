"use client";

import { SparklesIcon, StarIcon, TrendingUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useProductFilters } from "../../hooks/use-product-filters";

const sortOptions = [
    { value: "curated", label: "Curated", icon: StarIcon },
    { value: "trending", label: "Trending", icon: TrendingUpIcon },
    { value: "hot_and_new", label: "Hot & New", icon: SparklesIcon },
] as const;

export const ProductSort = () => {
    const [filters, setFilters] = useProductFilters();

    return (
        <div className="flex items-center gap-2">
            {sortOptions.map(({ value, label, icon: Icon }) => (
                <Button
                    key={value}
                    size="sm"
                    variant="secondary"
                    aria-pressed={filters.sort === value}
                    className={cn(
                        "rounded-full transition-colors",
                        filters.sort === value
                            ? "bg-black text-white hover:bg-black hover:text-white"
                            : "bg-white text-muted-foreground border-transparent hover:border-border hover:bg-white"
                    )}
                    onClick={() => setFilters({ sort: value })} // user clicks button Trending -> onClick: setFilters({ sort: "trending" }) -> nuqs updates URL: /?sort=trending -> useProductFilters() return filters.sort = "trending" -> re-render: trending button is now active -> Tanstack Query detects change in URL -> refetch with sort=trending -> server returns products sorted by reviewCount
                >
                    <Icon className="size-3.5" />
                    {label}
                </Button>
            ))}
        </div>
    );
};
