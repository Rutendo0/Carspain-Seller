"use client"

import { MainNav } from "@/components/main-nav"
import { StoreSwitcher } from "@/components/store-switcher"
import { useAuth } from "@/providers/auth-context"
import { Button } from "@/components/ui/button"

export const Navbar = () => {
  const { signOut } = useAuth()

  return (
    <div className="border-b">
        <div className="flex h-16 items-center px-4">
            <StoreSwitcher items={[]} /> {/* Note: StoreSwitcher needs client-side data or pass stores */}

            <MainNav/>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
        </div>
    </div>
  )
}
