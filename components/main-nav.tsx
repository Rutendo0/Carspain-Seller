"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react"



export const MainNav = ({className, ...props}: React.HtmlHTMLAttributes<HTMLElement>) => {

    const pathname = usePathname();
    const params = useParams();

    const routes = [
        {
            href: `/${params.storeId}`,
            label: "Overview",
            active: pathname === `/${params.storeId}`,
        },

        {
            href: `/${params.storeId}/products`,
            label: "Products",
            active: pathname === `/${params.storeId}/products`,
        },
        {
            href: `/${params.storeId}/orders`,
            label: "Orders",
            active: pathname === `/${params.storeId}/orders`,
        },
        {
            href: `/${params.storeId}/returns`,
            label: "Returns",
            active: pathname === `/${params.storeId}/returns`,
        },
        {
            href: `/${params.storeId}/profile`,
            label: "My Profile",
            active: pathname === `/${params.storeId}/profile`,
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
                route.active ? "text-primary border-b-2 border-[hsl(var(--primary))] pb-1"
                : "text-muted-foreground"
            )}
            >{route.label}</Link>
        )
        )}
    </nav>
  )
};

