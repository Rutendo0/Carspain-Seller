import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { redirect } from "next/navigation";
import {Store} from "@/types-db"
import {Navbar} from "@/components/navbar"

interface PortalLayoutProps {
    children: React.ReactNode,
    params: {userId: string}
}
const PortalLayout = async ({children, params}: PortalLayoutProps) => {
    const {userId} = auth()
    if(!userId){
        redirect("/sign-in")
    }
    

    return <>
        {children}
    </>


}

export default PortalLayout;