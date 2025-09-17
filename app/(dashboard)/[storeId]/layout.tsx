import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}

const DashboardLayout = async ({ children, params }: DashboardLayoutProps) => {
  const { storeId } = await params;
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

    if (!decodedToken.email_verified) {
      redirect("/sign-in?verify=true");
    }

    // Read mock store data from cookie written by /api/stores
    const storeDataJson = cookieStore.get("storeData")?.value;
    if (!storeDataJson) {
      redirect("/");
    }

    let storeData: any;
    try {
      storeData = JSON.parse(storeDataJson!);
    } catch {
      redirect("/");
    }

    if (!storeData?.id || storeData.id !== storeId) {
      redirect("/");
    }

    if (storeData.userId !== userId) {
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