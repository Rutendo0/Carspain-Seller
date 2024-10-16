import { db, storage } from "@/lib/firebase";
import { Store } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { updatePassword } from "firebase/auth/cordova";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";

export const PATCH = async(req: Request, {params}: {params: {storeId: string}}) => {
    try {
        const {userId} = auth()
        const body = await req.json()

        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }

        if(!params.storeId){
            return new NextResponse("No Store Selected", {status: 400})
        }

        const {name} = body;

        if(!name){
            return new NextResponse("Store Name Missing", {status: 400})
        }

        const docRef = doc(db, "stores", params.storeId)
        await updateDoc(docRef, {name});
        const store = (await getDoc(docRef)).data() as Store

        return NextResponse.json(store);



    } catch (error) {
        console.log(`STORES_PATCH:${error}`);
        return new NextResponse("Internal Server Error", {status : 500})
    }
}


export const DELETE = async(req: Request, {params}: {params: {storeId: string}}) => {
    try {
        const {userId} = auth()

        if(!userId){
            return new NextResponse("Unauthorized", {status: 400})
        }

        if(!params.storeId){
            return new NextResponse("No Store Selected", {status: 400})
        }

        const docRef = doc(db, "stores", params.storeId);



        //billboards & images
        const billboardsQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/billboards`, )
        );


        billboardsQuerySnapshot.forEach(async (billboardDoc) => {
            await deleteDoc(billboardDoc.ref)

            const imageUrl = billboardDoc.data().imageUrl
            if(imageUrl){
                const imageRef = ref(storage, imageUrl)
                await deleteObject(imageRef)
            }
        })



        //category

        const categoriesQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/categories`)
        )

        categoriesQuerySnapshot.forEach(async (categoryDoc)  => {
            await deleteDoc(categoryDoc.ref)
        })

        //industry

        const industriesQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/industries`)
        )

        industriesQuerySnapshot.forEach(async (industryDoc)  => {
            await deleteDoc(industryDoc.ref)
        })


        //brand

        const brandsQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/brands`)
        )

        brandsQuerySnapshot.forEach(async (brandDoc)  => {
            await deleteDoc(brandDoc.ref)
        })

        //model

        const modelsQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/models`)
        )

        modelsQuerySnapshot.forEach(async (modelDoc)  => {
            await deleteDoc(modelDoc.ref)
        })

        //products & images

        const productsQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/products`, )
        );


        productsQuerySnapshot.forEach(async (productDoc) => {
            await deleteDoc(productDoc.ref)

            const imagesArray = productDoc.data().images;
            if(imagesArray && Array.isArray(imagesArray)){
                await Promise.all(
                    imagesArray.map(async (image) => {
                        const imageRef = ref(storage, image.url)
                        await deleteObject(imageRef)
                    })
                )
            }
        })

        //orders & images

        const ordersQuerySnapshot = await getDocs(
            collection(db, `stores/${params.storeId}/orders`, )
        );


        ordersQuerySnapshot.forEach(async (orderDoc) => {

            await deleteDoc(orderDoc.ref);

            const ordersItemArray = orderDoc.data().orderItems;
            if(ordersItemArray && Array.isArray(ordersItemArray)){
                await Promise.all(
                    ordersItemArray.map(async (orderItem) => {
                        const imagesArray = orderItem.images;
                        if(imagesArray && Array.isArray(imagesArray)){
                            await Promise.all(
                                imagesArray.map(async (image) => {
                                    const imageRef = ref(storage, image.url)
                                    await deleteObject(imageRef)
                                })
                            )
                        }
                    })
                )
            }
            await deleteDoc(orderDoc.ref)

            const imagesArray = orderDoc.data().images;
            if(imagesArray && Array.isArray(imagesArray)){
                await Promise.all(
                    imagesArray.map(async (image) => {
                        const imageRef = ref(storage, image.url)
                        await deleteObject(imageRef)
                    })
                )
            }
        })



        //Todo: Delete all the subcollections and along with the data
        await deleteDoc(docRef);

        return NextResponse.json({msg: "Store and data deleted"});



    } catch (error) {
        console.log(`STORES_PATCH:${error}`);
        return new NextResponse("Internal Server Error", {status : 500})
    }
}