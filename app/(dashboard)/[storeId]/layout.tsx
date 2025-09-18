import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { storeId: string };
}

const DashboardLayout = async ({ children, params }: DashboardLayoutProps) => {
  if (!adminAuth || !adminDb) {
    throw new Error("Firebase admin not initialized");
  }

  const { storeId } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!userId) {
      redirect("/sign-in");
    }

    // Optional: enforce verified emails only if your flow requires it
    // if (!decodedToken.email_verified) {
    //   redirect("/sign-in?verify=true");
    // }

    // Validate store ownership directly from Firestore
    const doc = await adminDb.collection('stores').doc(storeId).get();
    if (!doc.exists) {
      redirect("/");
    }
    const store = doc.data() as { userId?: string } | undefined;
    if (!store || store.userId !== userId) {
      redirect("/");
    }
  } catch (error) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default DashboardLayout;