import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {Brand, Category, Model} from "@/types-db"
import { ModelForm } from "./_components/model-form";

const ModelPage = async ({
    params}: {params: { storeId : string ,modelId: string}}) => {
        const model = (await getDoc(doc(db, "stores", params.storeId,
            "models", params.modelId
        ))).data() as Model;

        const brandData = (
            await getDocs(
                collection(doc(db, "stores", params.storeId), "brands")
            )
        ).docs.map(doc => doc.data()) as Brand[];



    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ModelForm initialData={model} brands={brandData}></ModelForm>
        </div>
    );
}

export default ModelPage; 