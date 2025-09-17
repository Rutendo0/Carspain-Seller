import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Brand} from "@/types-db"
import { BrandForm } from "./_components/brand-form";

const BrandPage = async ({
    params}: {params: Promise<{ brandId: string}>}) => {
  const { brandId } = await params;

        const brand = (await getDoc(doc(db, "data", "wModRJCDon6XLQYmnuPT",
            "brands", brandId
        ))).data() as Brand;




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BrandForm initialData={brand}></BrandForm>
        </div>
    );
}

export default BrandPage; 