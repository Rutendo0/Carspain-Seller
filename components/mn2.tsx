"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react"



export const MainNav2 = ({className, ...props}: React.HtmlHTMLAttributes<HTMLElement>) => {

    const pathname = usePathname();
    const params = useParams();

    const routes = [
        {
            href: `/stores/${params.storeId}`,
            label: "Overview",
            active: pathname === `/stores/${params.storeId}`,
        },

        {
            href: `/stores/${params.storeId}/products`,
            label: "Products",
            active: pathname === `/stores/${params.storeId}/products`,
        },
        {
            href: `/stores/${params.storeId}/orders`,
            label: "Orders",
            active: pathname === `/stores/${params.storeId}/orders`,
        },
        {
            href: `/stores/${params.storeId}/settings`,
            label: "Settings",
            active: pathname === `/stores/${params.storeId}/settings`,
        },
    ];


  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6 pl-6")}>
        {routes.map((route) => (
            <Link
            key={route.href}
            href={route.href}
            className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
            >{route.label}</Link>
        )
        )}
    </nav>
  )
};

