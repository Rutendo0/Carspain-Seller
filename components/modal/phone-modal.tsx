"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import toast, { Toast } from "react-hot-toast"
import { Input } from "../ui/input"

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

interface ProductModalProps {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (number : string) => void,
    loading: boolean
}

export const PhoneModal = ({isOpen, 
    onClose, onConfirm, loading,
}: ProductModalProps) => {


   const[isMounted, setIsMounted] = useState(false)
   const[number, setNumber] = useState('')

    const handleConfirm = async (event: any) => {
        onConfirm(number)
    }

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if(!isMounted){
        return null
    }
    return (
        <Modal title="Please set the driver number below"
        description="This will allow the client to contact you for any order queries"
        isOpen={isOpen}
        onClose={onClose}>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <PhoneInput
                                    className="w-fulll shadow-lg p-4"
                                placeholder="Enter phone number"
                                onChange={(value) => { setNumber(value ? value.toString() : ''); }}
/>
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant={"destructive"}
                onClick={handleConfirm}>Confirm</Button>
            </div>
        </Modal>
        )
}