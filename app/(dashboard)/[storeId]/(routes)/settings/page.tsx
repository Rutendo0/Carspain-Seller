import { db } from "@/lib/firebase";
import { Store } from "@/types-db";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { doc, getDoc } from "firebase/firestore";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { use } from "react";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps{
    params : Promise<{
        storeId: string
    }>
}


const SettingsPage = async ({params}: SettingsPageProps) => {
  if (!adminAuth) {
    throw new Error("Firebase admin auth not initialized");
  }

  const { storeId } = await params;

    const cookieStore = await cookies()
    const token = cookieStore.get('__session')?.value

    if (!token) {
      redirect("/sign-in")
    }

    let userId
    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      redirect("/sign-in")
    }

    if (!userId) {
      redirect("/sign-in")
    }

    const store = (await getDoc(doc(db, "stores", storeId))
    ).data() as Store

    if(!store || store.userId !== userId) {
        redirect("/")
    }

    return <div className="flex-col">
        <div className="flex-1 space-y-5 p-8 pt-6">
            <SettingsForm initialData={store}/>
        </div>
    </div>
};

export default SettingsPage;