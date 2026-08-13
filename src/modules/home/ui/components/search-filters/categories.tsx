"use client";

import { useParams } from "next/navigation";
import { ListFilterIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

import { CategoryDropdown } from "./category-dropdown";
import { CategoriesSidebar } from "./categories-sidebar";


interface Props {
    data: CategoriesGetManyOutput;
};

export const Categories = ({ data }: Props) => {
    const params = useParams(); // Get URL params to determine active category

    const containerRef = useRef<HTMLDivElement>(null); // [All | Electronics | Clothing | Home ... [View All]]
    const measureRef = useRef<HTMLDivElement>(null); // invisible copy of ALL categories (off-screen)
    const viewAllRef = useRef<HTMLDivElement>(null); // [View All 🔽] button

    const [visibleCount, setVisibleCount] = useState(data.length); // how many categories to show based on available width
    const [isAnyHovered, setIsAnyHovered] = useState(false); // whether any category is hovered
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // whether the sidebar is open (for mobile)

    const categoryParam = params.category as string | undefined; // if URL is electronics/phones => categoryParam = "electronics"
    const activeCategory = categoryParam || "all"; // if URL is electronics/phones => activeCategory = "electronics", if URL is / => activeCategory = "all"
    
    const activeCategoryIndex = data.findIndex((cat) => cat.slug === activeCategory); // find index of active category to determine if it's hidden in the dropdown or visible in the main navigation
    const isActiveCategoryHidden = activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1; // When isActiveCategoryHidden = true, the "View All" button highlights to signal "your active category is behind here."

    useEffect(() => {
        const calculateVisible = () => {
            if(!containerRef.current || !measureRef.current || !viewAllRef.current) return;

            const containerWidth = containerRef.current.offsetWidth; // total bar width
            const viewAllWidth = viewAllRef.current.offsetWidth; // view all button width
            const availableWidth = containerWidth - viewAllWidth; // space for category items

            const items = Array.from(measureRef.current.children); // all hidden items
            let totalWidth = 0;
            let visible = 0;

            for(const item of items) {
                const width = item.getBoundingClientRect().width; // measure actual width of item

                if(totalWidth + width > availableWidth) break; // no more items can fit, stop counting
                totalWidth += width;
                visible++;
            }

            setVisibleCount(visible);
        };

        const resizeObserver = new ResizeObserver(calculateVisible); // recalculate on resize
        resizeObserver.observe(containerRef.current!); // observe the container for size changes

        return () => resizeObserver.disconnect(); // cleanup on unmount
    }, [data.length]);

    return (
        <div className="relative w-full">
            {/* Categories sidebar */}
            <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

            {/* Hidden dive to measure all items */}
            <div
                ref={measureRef}
                className="absolute opacity-0 pointer-events-none flex"
                style={{ position: "fixed", top: -9999, left: -9999 }}
            >
                {data.map((category) => (
                    <div key={category.id}>
                        <CategoryDropdown 
                            category={category}
                            isActive={activeCategory === category.slug}
                            isNavigationHovered={false}
                        />
                    </div>
                ))}
            </div>

            {/* Visible items */}
            <div
                ref={containerRef} // container for visible items and "View All" button
                className="flex flex-nowrap items-center"
                onMouseEnter={() => setIsAnyHovered(true)}
                onMouseLeave={() => setIsAnyHovered(false)}
            >
                {data.slice(0, visibleCount).map((category) => (
                    <div key={category.id}>
                        <CategoryDropdown 
                            category={category}
                            isActive={activeCategory === category.slug} // highlight active category in main navigation
                            isNavigationHovered={isAnyHovered}
                        />
                    </div>
                ))}

                <div ref={viewAllRef} className="shrink-0">  {/* Prevents this button from shrinking even when space is tight. It always stays full width. */}
                    <Button
                        variant="elevated"
                        className={cn(
                            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
                            isActiveCategoryHidden && !isAnyHovered && "bg-white border-primary",
                        )}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        View All
                        <ListFilterIcon className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
