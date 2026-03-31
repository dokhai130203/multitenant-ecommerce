import { redirect } from "next/navigation";

import { caller } from "@/trpc/server";

import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";

const Page = async () => {
    const session = await caller.auth.session();

    if(session.user) {
        redirect("/") // <-- if the user is already logged in, redirect to the home page
    }

    return <SignUpView />;
}
 
export default Page;
