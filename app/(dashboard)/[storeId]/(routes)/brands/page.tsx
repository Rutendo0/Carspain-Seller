import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { BrandClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Brand } from "@/types-db";
import { BrandColumns } from "./components/columns";
import { it } from "node:test";


const BrandsPage = async ({params} : {params : {storeId: string}}) => {


    const BrandsData = (
        await getDocs(
            collection(doc(db, "stores", params.storeId), "brands")
        )
    ).docs.map(doc => doc.data()) as Brand[];



    const formattedBrands : BrandColumns[] = BrandsData.map(
        item =>({
            id: item.id,
            name: item.name,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BrandClient data={formattedBrands}/>
        </div>
    </div>
}

export default BrandsPage;