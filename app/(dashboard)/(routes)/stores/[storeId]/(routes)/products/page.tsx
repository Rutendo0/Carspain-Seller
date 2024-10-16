import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import {  ProductClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Product } from "@/types-db";
import { ProductColumns } from "./components/columns";
import { it } from "node:test";
import { formatter } from "@/lib/utils";


const ProductsPage = async ({params} : {params : {storeId: string}}) => {


    const ProductsData = (
        await getDocs(
            collection(doc(db, "stores", params.storeId), "products")
        )
    ).docs.map(doc => doc.data()) as Product[];



    const formattedProducts : ProductColumns[] = ProductsData.map(
        item =>({
            id: item.id,
            name: item.name,
            price: formatter.format(item.price),
            isFeatured: item.isFeatured,
            isArchived: item.isArchived,
            category: item.category,
            industry: item.industry,
            brand: item.brand,
            model: item.model,
            images: item.images,
            year: item.year ? format(item.createdAt.toDate(), "yyyy") : "",
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductClient data={formattedProducts}/>
        </div>
    </div>
}

export default ProductsPage;