"use client"

import { useAuth } from "@/providers/auth-context"
import { useStoreModal } from "@/hooks/use-store-modal"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ClientHome() {
  const { user: isSignedIn, loading, signOut } = useAuth()
  const storeModal = useStoreModal()
  const router = useRouter()
  const [checkingStore, setCheckingStore] = useState(false)

  useEffect(() => {
    const checkStore = async () => {
      if (!loading && isSignedIn && !checkingStore) {
        setCheckingStore(true)
        try {
          const response = await fetch('/api/stores', { credentials: 'include' })
          if (response.status === 401) {
            // Session invalid, sign out
            await signOut()
            return
          } else if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { message: response.statusText };
            }
            console.error('Failed to fetch store:', errorData);
            storeModal.onOpen()
            setCheckingStore(false)
            return
          }
          const data = await response.json()
          if (data.store) {
            router.push(`/${data.store.id}`)
          } else {
            storeModal.onOpen()
          }
        } catch (error) {
          console.error('Error checking store:', error)
          storeModal.onOpen()
        } finally {
          setCheckingStore(false)
        }
      }
    }

    checkStore()
  }, [isSignedIn, loading, checkingStore, router, storeModal, signOut])

  if (loading || checkingStore) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return null
}