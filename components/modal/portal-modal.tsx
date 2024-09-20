"use client"

import { z } from "zod";
import { Modal } from "../modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios"
import toast from "react-hot-toast";
import { addDoc, and, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types-db";

const formSchema = z.object({
    userId: z.string().min(3,{message:"Order ID should be atleast 3 characters"})
})

interface ProtalModalProps {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
    loading: boolean
}

export const PortalModal = ({isOpen, 
    onClose, onConfirm, loading,
}: ProtalModalProps) => {
    const[isMounted, setIsMounted] = useState(false)

    const [isLoading, setIsloading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: ""
        }
    })
    let product : Order;

    const onSumbit = async (values: z.infer<typeof formSchema>) =>{
        try {
            setIsloading(true);

            const storesSnapshot = await getDocs(collection(db, "stores"));
            const storeIds = storesSnapshot.docs.map(doc => doc.id);
    
            // Step 2: Fetch orders for each store

            for (const storeId of storeIds) {
    
                const ordersQuery = query(
                    collection(doc(db, "stores", storeId), "orders"),
                    where("userId", "==", values.userId), where ("order_status", "!=", "completed" )
                );
                const ordersSnapshot = await getDocs(ordersQuery);

                if(!ordersSnapshot.empty){
                    break; // Exit loop once the product is found
                }

            }

            toast.success("Order Found");
            window.location.assign(`/driver-portal/${values.userId}`)


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
        }
    };

    return(
        <Modal title="Fulfill Order"
        description="Enter the Order ID in order to fullfill an order"
        isOpen={isOpen}
        onClose={onClose}>

            <div className="space-y-4 py-2 pb-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSumbit)}>
                        <FormField control={form.control} name="userId"   
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Order ID</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Alphanumeric Value"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <div className="pt-6 spce-x-2 flex items-center justify-end w-full">
                            <Button disabled={isLoading}  type="button" variant={"outline"} size={"sm"}>
                                Cancel</Button>
                            <Button disabled={isLoading} type="submit" size={"sm"}>Continue</Button>
                        </div>
                    </form>
                </Form>
            </div>

        </Modal>
    )
}