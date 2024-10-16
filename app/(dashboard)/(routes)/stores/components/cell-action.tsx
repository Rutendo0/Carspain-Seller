"use client"

import { useRouter } from "next/navigation"
import { StoreColumns } from "./columns"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Car, Copy, Edit, Home, MoreVertical, Phone, Trash } from "lucide-react"
import { DropdownMenuContent,  DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import axios from "axios"
import { AlertModal } from "@/components/modal/alert-modal"
import { useOrigin } from "@/hooks/use-origin"
import { Router } from "next/router"

interface CellActionProps {
    data: StoreColumns
}

export const    CellAction = ({data}: CellActionProps) => {
    const router = useRouter()
    const params = useParams()
    const origin = useOrigin()

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

     const onCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success("Phone number copied to clipboard")
     }
     const onCopyUrl = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success("Order Link copied to clipboard")
     }

     const onDelete = async() => {

        try {
            setIsLoading(true);

            await axios.delete(`/api/orders/single/${data.id}`);


            toast.success("Order Removed");
            router.push(`/orders`);
            router.refresh();


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsLoading(false)
            setOpen(false);
        }
    }

    const onProduct = async (data:any) => {
        
    }


    const onUpdate = async (data:any) => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/orders/single/${data.id}`, data);
            router.push(`/orders`)
            location.reload();
            toast.success("Order Updated")
            setIsLoading(false);
        } catch (error) {
            toast.error("Something Went Wrong")
        }finally{
            router.refresh();
            setIsLoading(false)
        }
    }
  
  
    return <>
        <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading} />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0" variant={"ghost"}>
                    <span className="sr-only">Open</span>
                    <MoreVertical className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCopy(data.number)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Shop Owner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy(`Shop owner National ID: ${data.number},
                    \n  Shop Owner Address: ${data.address}
                    \n Shop Owner Name: ${data.store_owner}
                    \n Shop Name: ${data.name}`)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Copy Owner Details
                </DropdownMenuItem>



                <DropdownMenuItem onClick={() => router.push(`/stores/${data.id}`)}>
                    <Home className="h-4 w-4 mr-2" />
                    View Store
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Store
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}
