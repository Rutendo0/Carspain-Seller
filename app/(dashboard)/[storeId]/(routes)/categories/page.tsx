import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import { CategoryClient } from "./components/client";
import { db } from "@/lib/firebase";
import {  Category } from "@/types-db";
import { CategoryColumns } from "./components/columns";
import { it } from "node:test";


const CategoriesPage = async ({params} : {params : {storeId: string}}) => {


    const categoriesData = (
        await getDocs(
            collection(doc(db, "stores", params.storeId), "categories")
        )
    ).docs.map(doc => doc.data()) as Category[];



    const formattedCategories : CategoryColumns[] = categoriesData.map(
        item =>({
            id: item.id,
            name: item.name,
            billboardLabel: item.billboardLabel,
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryClient data={formattedCategories}/>
        </div>
    </div>
}

export default CategoriesPage;