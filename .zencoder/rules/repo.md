# Repository overview

- Name: Carspian-Seller
- Framework: Next.js (App Router)
- Language: TypeScript/TSX
- Styling: Tailwind CSS
- Auth: Firebase Auth (client) + custom session cookie via API routes, verified with Firebase Admin
- Database: Firestore (firebase-admin)
- Payments: Stripe (lib/stripe.ts present)

## Key structure
- app/
  - layout.tsx: wraps providers (AuthProvider, ModalProvider, ToastProvider)
  - page.tsx: landing and post-login store check flow
  - (root)/(routes)/sign-in: email/password sign-in; calls /api/auth/set-session
  - (dashboard)/[storeId]: dashboard routes (protected by middleware)
  - api/
    - auth/set-session: sets __session cookie after Firebase auth
    - auth/sign-out: clears __session cookie
    - stores: GET returns existing store for user; POST creates store
- providers/
  - auth-context.tsx: exposes user, loading, signOut
- lib/
  - firebase.ts: client SDK init from NEXT_PUBLIC_* envs
  - firebase-admin.ts: admin SDK from server envs
- middleware.ts: protects /dashboard and API routes using __session cookie

## Important env vars
- NEXT_PUBLIC_*: Firebase client config
- FIREBASE_*: Admin credentials; note FIREBASE_PRIVATE_KEY expects \n escapes

## Common issues
- Cookie secure flag on localhost: ensure __session cookie is not secure on HTTP (fixed in auth routes).
- Missing cookie path on deletion: ensure path: '/' when clearing cookie.
- If GET /api/stores returns 401 after sign-in, check cookie presence and middleware.

## Notes
- When signed-in, Home page fetches /api/stores to redirect to /{storeId} or open store creation modal.
- Middleware checks __session for /dashboard and /api (except /api/auth).