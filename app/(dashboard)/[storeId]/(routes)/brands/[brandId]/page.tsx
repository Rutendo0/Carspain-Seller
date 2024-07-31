import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Brand} from "@/types-db"
import { BrandForm } from "./_components/brand-form";

const BrandPage = async ({
    params}: {params: { storeId : string ,brandId: string}}) => {

        const brand = (await getDoc(doc(db, "stores", params.storeId,
            "brands", params.brandId
        ))).data() as Brand;




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BrandForm initialData={brand}></BrandForm>
        </div>
    );
}

export default BrandPage; 