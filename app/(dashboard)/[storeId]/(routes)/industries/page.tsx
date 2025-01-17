import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { IndustryClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Industry } from "@/types-db";
import { IndustryColumns } from "./components/columns";
import { it } from "node:test";


const IndustriesPage = async () => {


    const IndustriesData = (
        await getDocs(
            collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "industries")
        )
    ).docs.map(doc => doc.data()) as Industry[];



    const formattedIndustries : IndustryColumns[] = IndustriesData.map(
        item =>({
            id: item.id,
            name: item.name,
            value: item.value,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <IndustryClient data={formattedIndustries}/>
        </div>
    </div>
}

export default IndustriesPage;