import { cookies as getCookies } from "next/headers";

interface Props {
    prefix: string;
    value: string;
}

const getCookieOptions = (prefix: string) => ({ // set a rule for the cookie options based on the prefix provided
    name: `${prefix}-token`, // sets the name of the cookie.
    httpOnly: true, // the cookie cannot be accessed via JavaScript, which helps protect against cross-site scripting (XSS) attacks.
    path: "/", // Cookie applies to the entire website.
    ...(process.env.NODE_ENV !== "development" && { // only apply these rules in production
        sameSite: "none" as const, // allow cross-site cookie usage in production
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN, // This sets the domain for the cookie.                              
        secure: true, // This means the cookie will only be sent over HTTPS
    }),
});

export const generateAuthCookie = async ({ // after login, create a cookie with the JWT token to maintain the user's session.
    prefix,
    value,
}: Props) => {
    const cookies = await getCookies(); // get cookie store from the request headers

    cookies.set({
        ...getCookieOptions(prefix), // get all the rules up there
        value, // set JWT token value to the cookie
    });
};

export const clearAuthCookie = async ({ prefix }: { prefix: string }) => { // work at browser
    const cookies = await getCookies();

    cookies.set({
        ...getCookieOptions(prefix), // get all the rules up there
        value: "", // clear the cookie value
        expires: new Date(0),
    });
};
