"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import toast, { Toast } from "react-hot-toast"
import axios from "axios"

interface DeleteModalProps {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
    loading: boolean,
    useriD: string
}

export const DeleteModal = async ({isOpen, 
    onClose, onConfirm, loading,
}: DeleteModalProps) => {


   const[isMounted, setIsMounted] = useState(false)

   const handleConfirm = () => {
    onConfirm();
    toast.success("Action confirmed!");
    window.location.assign(`/driver-portal/No User`)
};


    useEffect(() => {
        setIsMounted(true)
    }, [])






    if(!isMounted){
        return null
    }
    return (
        <Modal title="Are you sure you want to decline this order?"
        description="Reversing this action cannot be undone."
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