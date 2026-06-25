"use client";

import Link from "next/link";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarItem {
    href: string;
    children: React.ReactNode;
}

interface Props {
    items: NavbarItem[];
    open: boolean
    onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({
    items, 
    open,
    onOpenChange,
} : Props) => {
    const trpc = useTRPC();
    const session = useQuery(trpc.auth.session.queryOptions());

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="p-0 transition-none"
            >
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="w-full text-left p-4 flex items-center hover:bg-black hover:text-white text-base font-medium"
                            onClick={() => onOpenChange(false)}
                        >
                            {item.children}
                        </Link>
                    ))}
                    <div className="border-t">
                        {session.data?.user ? (
                            <Link 
                                href="/admin" onClick={() => onOpenChange(false)}
                                className="w-full text-left p-4 flex items-center hover:bg-black hover:text-white text-base font-medium"
                            >
                                Dashboard
                            </Link>   
                        ) : (
                            <>
                                <Link 
                                    href="/sign-in" onClick={() => onOpenChange(false)} className="w-full text-left p-4 flex items-center hover:bg-black hover:text-white text-base font-medium">
                                    Log in
                                </Link>
                                <Link 
                                    href="/sign-up" onClick={() => onOpenChange(false)} className="w-full text-left p-4 flex items-center hover:bg-black hover:text-white text-base font-medium">
                                    Start selling
                                </Link>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
