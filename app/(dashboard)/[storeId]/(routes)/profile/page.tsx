import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileClient from './profile_client'

async function getBaseUrl() {
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '')
}

export default async function ProfilePage() {
  // Build absolute URL from request headers and forward cookies for auth
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '')
  const cookieHeader = h.get('cookie') ?? ''

  const res = await fetch(`${base}/api/profile`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  })
  if (res.status === 401) {
    redirect('/sign-in')
  }
  if (!res.ok) {
    return <div className="p-8"><h1 className="text-xl font-semibold">My Profile</h1><p className="text-sm text-muted-foreground mt-2">Failed to load profile.</p></div>
  }
  const profile = await res.json()
  return <ProfileClient initialData={profile} />
}