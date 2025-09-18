import HomePage from "./(root)/(routes)/page"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function Page() {
  return <HomePage />
}