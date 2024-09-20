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
            href: `/`,
            label: "Overview",
            active: pathname === `/`,
        },
        {
            href: `/billboards`,
            label: "Billboards",
            active: pathname === `/billboards`,
        },
        {
            href: `/categories`,
            label: "Categories",
            active: pathname === `/categories`,
        },
        {
            href: `/industries`,
            label: "Industries",
            active: pathname === `/industries`,
        },
        {
            href: `/brands`,
            label: "Brands",
            active: pathname === `/brands`,
        },
        {
            href: `/models`,
            label: "Models",
            active: pathname === `/models`,
        },
        {
            href: `/products`,
            label: "Products",
            active: pathname === `/products`,
        },
        {
            href: `/orders`,
            label: "Orders",
            active: pathname === `/orders`,
        },
        {
            href: `/settings`,
            label: "Settings",
            active: pathname === `/settings`,
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

