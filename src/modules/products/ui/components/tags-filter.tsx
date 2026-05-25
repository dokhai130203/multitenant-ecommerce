import { LoaderIcon } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Checkbox } from "@/components/ui/checkbox";

interface TagsFilterProps {
    value?: string[] | null;
    onChange: (value: string[]) => void;
}

export const TagsFilter = ({ value, onChange }: TagsFilterProps) => {
    const trpc = useTRPC();
    const {
        data, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteQuery(trpc.tags.getMany.infiniteQueryOptions(
        {
            limit: DEFAULT_LIMIT,
        },
        {
           getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
           },
        }
    ));

    const onClick = (tag: string) => { // onClick("tag1") → value?.includes("tag1") ? onChange(value?.filter((t) => t !== "tag1") || []) : onChange([...(value || []), "tag1"])
        if(value?.includes(tag)) { // if the tag is already on the list
            onChange(value?.filter((t) => t !== tag) || []); // value?.filter((t) => t !== tag) → ["tag1", "tag2", "tag3"].filter((t) => t !== "tag2") → ["tag1", "tag3"] -> we remove the tag from the list
        } else {
            onChange([...(value || []), tag]); // → onChange([...( null || [] ), "electronics"]) → onChange(["electronics"]) -> otherwise, we add the tag to the list
        }
    };

    return (
        <div className="flex flex-col gap-y-2">
            {isLoading ? (
                <div className="flex items-center justify-center p-4">
                    <LoaderIcon className="size-4 animate-spin" />
                </div>
            ) : (
                data?.pages.map((page) => 
                    page.docs.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between cursor-pointer"        
                            onClick={() => onClick(tag.name)}
                        >
                            <p className="font-medium">{tag.name}</p>
                            <Checkbox
                                checked={value?.includes(tag.name)}
                                onCheckedChange={() => onClick(tag.name)}
                            />
                        </div>
                    ))
                )
            )}
            {hasNextPage && (
                <button
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="underline font-medium justify-start text-start disabled:opacity-50 cursor-pointer"
                >
                    Load more...
                </button>
            )}
        </div>
    );
};
