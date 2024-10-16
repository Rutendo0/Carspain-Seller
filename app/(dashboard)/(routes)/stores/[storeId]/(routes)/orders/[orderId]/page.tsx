import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Industry} from "@/types-db"
import { IndustryForm } from "./_components/industry-form";

const IndustryPage = async ({
    params}: {params: { storeId : string ,industryId: string}}) => {

        const industry = (await getDoc(doc(db, "stores", params.storeId,
            "industries", params.industryId
        ))).data() as Industry;




    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <IndustryForm initialData={industry}></IndustryForm>
        </div>
    );
}

export default IndustryPage; 