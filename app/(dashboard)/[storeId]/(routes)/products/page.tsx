import { collection, doc, getDocs } from "firebase/firestore";
import {format} from "date-fns"
import {  ProductClient } from "./components/client";
import { db } from "@/lib/firebase";
import { Product } from "@/types-db";
import { ProductColumns } from "./components/columns";
import { it } from "node:test";
import { formatter } from "@/lib/utils";
import emailjs from 'emailjs-com';
import { currentUser } from "@clerk/nextjs/server";
import toast from "react-hot-toast";

const ProductsPage = async ({params} : {params : {storeId: string}}) => {


    const ProductsData = (
        await getDocs(
            collection(doc(db, "stores", params.storeId), "products")
        )
    ).docs.map(doc => doc.data()) as Product[];

    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress;
    const username = user?.username;

    const formattedProducts : ProductColumns[] = ProductsData.map(
        item =>({
            id: item.id,
            name: item.name,
            price: formatter.format(item.price),
            stock: item.stock,
            isFeatured: item.isFeatured,
            isArchived: item.isArchived,
            category: item.category,
            industry: item.industry,
            brand: item.brand,
            model: item.model,
            images: item.images,
            year: item.year ? format(item.year, "yyyy") : "",
            createdAt: item.createdAt ? format(item.createdAt.toDate(), "MMMM dd, yyyy") : ""
        })
    )

    


    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductClient data={formattedProducts} email={email} uname={username}/>
        </div>
    </div>
}
 
export default ProductsPage;