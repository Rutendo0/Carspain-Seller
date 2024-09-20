import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {  Brand, Category, Industry, Model, Product} from "@/types-db"


const ProductPage = async ({
    params}: {params: { productId: string}}) => {

        const storesSnapshot = await getDocs(collection(db, "stores"));
        const storeIds = storesSnapshot.docs.map(doc => doc.id);
        let holder : Product = {} as Product;
        for (const storeId of storeIds) {
            
            const Product = (await getDoc(doc(db, storeId,
                "products", params.productId
            ))).data() as Product;

            if(Product.id != "" || Product.id != null ){
                holder = Product;
            }
        }



        const categoriesData = (
            await getDocs(collection(doc(db, "data"), 
        "categories"))
        ).docs.map(doc => doc.data()) as Category[];

        const industriesData = (
            await getDocs(collection(doc(db, "data"), 
        "industries"))
        ).docs.map(doc => doc.data()) as Industry[];

        const brandsData = (
            await getDocs(collection(doc(db, "data"), 
        "brands"))
        ).docs.map(doc => doc.data()) as Brand[];

        const modelsData = (
            await getDocs(collection(doc(db, "data"), 
        "models"))
        ).docs.map(doc => doc.data()) as Model[];




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
        </div>
    );
}

export default ProductPage; 