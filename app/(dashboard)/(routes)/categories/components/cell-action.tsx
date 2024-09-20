"use client"

import { useRouter } from "next/navigation"
import { CategoryColumns } from "./columns"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Edit, MoreVertical, Trash } from "lucide-react"
import { DropdownMenuContent,  DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"
import axios from "axios"
import { AlertModal } from "@/components/modal/alert-modal"

interface CellActionProps {
    data: CategoryColumns
}

export const    CellAction = ({data}: CellActionProps) => {
    const router = useRouter()
    const params = useParams()

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

     const onCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success("Category ID Copied")
     }

     const onDelete = async() => {
        try {
            setIsLoading(true);

            await axios.delete(`/api/${params.storeId}/categories/${data.id}`);


            toast.success("Category Removed");
            router.push(`/${params.storeId}/categories`);
            router.refresh();


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsLoading(false)
            setOpen(false);
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
                <DropdownMenuItem onClick={() => onCopy(data.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => 
                    router.push(`/${params.storeId}/categories/${data.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}
