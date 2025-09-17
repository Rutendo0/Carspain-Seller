"use server"
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ReturnsPage from "./returns";
import { ReturnData } from "@/types-db"; // Import the ReturnData type

const Home = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  // Fetch returns data for the specific store
  const returnsQuery = query(
    collection(db, "data", "wModRJCDon6XLQYmnuPT", "returns"),
    where("originalOrder", "==", storeId)
  );

  const returnsSnapshot = await getDocs(returnsQuery);
  const returnsData = returnsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ReturnData[]; // Explicit type casting here

  console.log(returnsData[0])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReturnsPage initialData={returnsData} storeId={storeId} />
      </div>
    </div>
  );
}

export default Home;