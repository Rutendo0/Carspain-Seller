import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { redirect } from "next/navigation";
import {Store} from "@/types-db"
import {Navbar} from "@/components/navbar"

interface DashboardLayoutProps {
    children: React.ReactNode,
}
const DashboardLayout = async ({children}: DashboardLayoutProps) => {
    const {userId} = auth()
    if(!userId){
        redirect("/sign-in")
    }
    


    return <>
        <Navbar />
        {children}
    </>


}

export default DashboardLayout;