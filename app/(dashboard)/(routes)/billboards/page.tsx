import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { BillboardClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { BillboardColumns } from "./components/columns";
import { it } from "node:test";


const BillboardsPage = async ({params} : {params : {storeId: string}}) => {


    const billboardData = (
        await getDocs(
            collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "billboards")
        )
    ).docs.map(doc => doc.data()) as Billboards[];



    const formattedBillboards : BillboardColumns[] = billboardData.map(
        item =>({
            id: item.id,
            label: item.label,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BillboardClient data={formattedBillboards}/>
        </div>
    </div>
}

export default BillboardsPage;