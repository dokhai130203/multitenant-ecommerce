"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button"; 

interface Props {
    children?: ReactNode;
    className?: string;
    onComplete?: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "elevated";
}

export const SignOutButton = ({
    children = "Sign Out",
    className,
    onComplete,
    variant = "secondary",
}: Props) => {
    const router = useRouter(); // redirect after logout
    const trpc = useTRPC(); // access to the trpc client to call mutations
    const queryClient = useQueryClient(); // invalidate cache

    const logout = useMutation(trpc.auth.logout.mutationOptions({ // 
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
            onComplete?.(); // close the sidebar (only on mobile)
            router.push("/");
            router.refresh(); // refresh the page to update the UI after logout
        },
    }));

    return (
        <Button
            type="button"
            variant={variant}
            disabled={logout.isPending}
            className={cn("transition-colors", className)}
            onClick={() => logout.mutate()}
        >
            {logout.isPending ? "Signing out..." : children}
        </Button>
    );
};
