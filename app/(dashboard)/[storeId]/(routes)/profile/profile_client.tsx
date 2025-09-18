"use client"

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '@/components/image-upload'
import toast from 'react-hot-toast'

interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface ProfileData {
  name?: string
  phone?: string
  avatarUrl?: string
  companyName?: string
  taxId?: string
  vatNumber?: string
  address?: Address
  stripeAccountId?: string
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
}

export default function ProfileClient({ initialData }: { initialData: ProfileData }) {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState<ProfileData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    avatarUrl: initialData?.avatarUrl || '',
    companyName: initialData?.companyName || '',
    taxId: initialData?.taxId || '',
    vatNumber: initialData?.vatNumber || '',
    address: {
      line1: initialData?.address?.line1 || '',
      line2: initialData?.address?.line2 || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      postalCode: initialData?.address?.postalCode || '',
      country: initialData?.address?.country || '',
    },
  })
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)

  const onChange = (field: keyof ProfileData, value: any) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const onAddressChange = (field: keyof Address, value: any) => {
    setForm((f) => ({ ...f, address: { ...(f.address || {}), [field]: value } }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to save')
      }
      toast.success('Profile updated')
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const connectStripe = async () => {
    setLinking(true)
    try {
      const url = new URL(window.location.href)
      const base = `${url.protocol}//${url.host}`
      const res = await fetch(`/api/profile/stripe?refresh_url=${encodeURIComponent(base)}&return_url=${encodeURIComponent(base)}`, { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('No onboarding link returned')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start Stripe onboarding')
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="My Profile" description="Manage your personal and payment details" />
        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone || ''} onChange={(e) => onChange('phone', e.target.value)} placeholder="e.g. +1 555 555 5555" />
              </div>
              <div>
                <Label>Avatar</Label>
                <ImageUpload
                  value={form.avatarUrl ? [form.avatarUrl] : []}
                  onChange={(url) => onChange('avatarUrl', url)}
                  onRemove={() => onChange('avatarUrl', '')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company & Tax</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Company Name</Label>
                <Input value={form.companyName || ''} onChange={(e) => onChange('companyName', e.target.value)} placeholder="Your company" />
              </div>
              <div>
                <Label>Tax ID</Label>
                <Input value={form.taxId || ''} onChange={(e) => onChange('taxId', e.target.value)} placeholder="Tax ID" />
              </div>
              <div>
                <Label>VAT Number</Label>
                <Input value={form.vatNumber || ''} onChange={(e) => onChange('vatNumber', e.target.value)} placeholder="VAT" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Line 1</Label>
                <Input value={form.address?.line1 || ''} onChange={(e) => onAddressChange('line1', e.target.value)} />
              </div>
              <div>
                <Label>Line 2</Label>
                <Input value={form.address?.line2 || ''} onChange={(e) => onAddressChange('line2', e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.address?.city || ''} onChange={(e) => onAddressChange('city', e.target.value)} />
              </div>
              <div>
                <Label>State/Region</Label>
                <Input value={form.address?.state || ''} onChange={(e) => onAddressChange('state', e.target.value)} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={form.address?.postalCode || ''} onChange={(e) => onAddressChange('postalCode', e.target.value)} />
              </div>
              <div>
                <Label>Country (ISO 2)</Label>
                <Input value={form.address?.country || ''} onChange={(e) => onAddressChange('country', e.target.value)} placeholder="US, GB, KE..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payouts (Stripe Connect)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-sm text-muted-foreground">
              Status: {initialData?.payoutsEnabled ? 'Payouts enabled' : 'Not enabled'} • Details submitted: {initialData?.detailsSubmitted ? 'Yes' : 'No'}
            </div>
            <div className="flex gap-2">
              <Button disabled={linking} onClick={connectStripe}>
                {linking ? 'Connecting…' : (initialData?.stripeAccountId ? 'Continue Onboarding' : 'Connect with Stripe')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </div>
    </div>
  )
}