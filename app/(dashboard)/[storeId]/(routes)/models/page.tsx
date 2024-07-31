import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { ModelClient } from "./components/client";
import { db } from "@/lib/firebase";
import {   Model } from "@/types-db";
import { ModelColumns } from "./components/columns";
import { it } from "node:test";


const ModelsPage = async ({params} : {params : {storeId: string}}) => {


    const ModelsData = (
        await getDocs(
            collection(doc(db, "stores", params.storeId), "models")
        )
    ).docs.map(doc => doc.data()) as Model[];



    const formattedModels : ModelColumns[] = ModelsData.map(
        item =>({
            id: item.id,
            name: item.name,
            brandLabel: item.brandLabel,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ModelClient data={formattedModels}/>
        </div>
    </div>
}

export default ModelsPage;