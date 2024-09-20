import { db } from "@/lib/firebase";
import { Billboards, Category } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const PATCH = async (reQ: Request,
    {params} : {params: { categoryId : string}}
) => {
    try {
        const {userId} = auth()
        const body = await reQ.json()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    
        const {name, billboardLabel, billboardId} = body;
    
    
        if(!name){
            return new NextResponse("Category Name Missing", {status: 400})
        }
        if(!billboardId){
            return new NextResponse("Billboard Image Missing", {status: 400})
        }


        if(!params.categoryId){
            return new NextResponse("No Category selected", {status: 400})
        }


     const categoryRef = await getDoc(
        doc(db, "data", "wModRJCDon6XLQYmnuPT", "categories", params.categoryId)
     )

     if(categoryRef.exists()){
        await updateDoc(
            doc(db, "data", "wModRJCDon6XLQYmnuPT", "categories", params.categoryId), {
                ...categoryRef.data(),
                name,
                billboardId,
                billboardLabel,
                updatedAt: serverTimestamp(),
            }
        )
     }else{
        return new NextResponse("Category not found!", {status: 404})
     }

     const category = (
        await getDoc(
            doc(db, "data", "wModRJCDon6XLQYmnuPT", "categories", params.categoryId)
        )
     ).data() as Category;


    return NextResponse.json(category);
    
    
    }
   

 catch (error) {
    console.log(`CATEGORY_PATCH:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};




export const DELETE = async (reQ: Request,
    {params} : {params: { categoryId : string}}
) => {
    try {
        const {userId} = auth()
    
        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }
    




        if(!params.categoryId){
            return new NextResponse("No Category selected", {status: 400})
        }

     const categoryRef = doc(db, "data", "wModRJCDon6XLQYmnuPT", "categories", params.categoryId)

     await deleteDoc(categoryRef);



    return NextResponse.json({msg: "Category Deleted"});
    
    
    }
   

 catch (error) {
    console.log(`CATEGORY_DELETE:${error}`);
    return new NextResponse("Internal Server Error", {status : 500})
}
};
