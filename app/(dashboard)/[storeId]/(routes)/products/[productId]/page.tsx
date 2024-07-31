import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {  Brand, Category, Industry, Model, Product} from "@/types-db"
import { ProductForm } from "./_components/product-form";

const ProductPage = async ({
    params}: {params: { storeId : string ,productId: string}}) => {

        const Product = (await getDoc(doc(db, "stores", params.storeId,
            "products", params.productId
        ))).data() as Product;


        const categoriesData = (
            await getDocs(collection(doc(db, "stores", params.storeId), 
        "categories"))
        ).docs.map(doc => doc.data()) as Category[];

        const industriesData = (
            await getDocs(collection(doc(db, "stores", params.storeId), 
        "industries"))
        ).docs.map(doc => doc.data()) as Industry[];

        const brandsData = (
            await getDocs(collection(doc(db, "stores", params.storeId), 
        "brands"))
        ).docs.map(doc => doc.data()) as Brand[];

        const modelsData = (
            await getDocs(collection(doc(db, "stores", params.storeId), 
        "models"))
        ).docs.map(doc => doc.data()) as Model[];




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductForm initialData={Product}
            industries={industriesData}
            categories={categoriesData}
            brands={brandsData}
            models={modelsData}></ProductForm>
        </div>
    );
}

export default ProductPage; 