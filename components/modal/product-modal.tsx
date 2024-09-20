"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import toast, { Toast } from "react-hot-toast"

interface ProductModalProps {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
    loading: boolean
}

export const ProductModal = ({isOpen, 
    onClose, onConfirm, loading,
}: ProductModalProps) => {
   const[isMounted, setIsMounted] = useState(false)
   const handleConfirm = () => {
    onConfirm();
    toast.success("Action confirmed!");
};
    useEffect(() => {
        setIsMounted(true)
    }, [])


    if(!isMounted){
        return null
    }
    return (
        <Modal title="Are you sure you want to change the order status?"
        description="Reversing this action will put the orders in processing status"
        isOpen={isOpen}
        onClose={onClose}>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant={"outline"}
                onClick={onClose}>Cancel</Button>
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant={"destructive"}
                onClick={handleConfirm}>Confirm</Button>
            </div>
        </Modal>
        )
}