"use client"

import { z } from "zod";
import { Modal } from "../modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import 'react-phone-number-input/style.css'
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios"
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";
import PhoneInput from 'react-phone-number-input'

const formSchema = z.object({
    name: z.string(),
    address: z.string().min(3,{message:"Store address cant be less than 3 characters"}),
    pnumber: z.string(),
    store_owner: z.string().min(3,{message:"Store owner cant be less than 3 characters"}),
    ownerID: z.string().min(8,{message:"Store owners ID cant be less than 3 characters"}),
    tax_clearance: z.string().min(3,{message:"Tax clearance ID cant be less than 3 characters"}),
})

export const StoreModal = () => {
    const storeModal = useStoreModal();

    const [isLoading, setIsloading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            store_owner: '',
            pnumber: '',
            ownerID: '',
            tax_clearance: ''
        }
    })

    const onSumbit = async (values: z.infer<typeof formSchema>) =>{
        try {
            setIsloading(true);
            const data = {
                ...values,
                number: number
            }
            const response = await axios.post("/api/stores", data);
            toast.success("Store Create");
            window.location.assign(`/${response.data.id}`)


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
        }
    };

    const [number, setNumber] = useState('')

    return(
        <Modal title="Create a new Store"
        description="Add a new store to duplicate your on-premise infrastructure online!"
        isOpen={storeModal.isOpen}
        onClose={storeModal.onClose}>

            <div className="space-y-4 py-2 pb-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSumbit)}>
                        <FormField control={form.control} name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Your Store Name"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="address"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Store Address</FormLabel>
                                
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Your Store Address"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


<FormField control={form.control} name="pnumber"
                        render={({field}) => (
                            <FormItem className="mb-3">
                                <FormLabel className="mr-10">Phone Number</FormLabel>
                                <Separator />
                                <FormControl>
                                <PhoneInput
                                {...field}
                                    className="w-fulll shadow-lg p-4"
                                placeholder="Enter phone number"
                                onChange={(value) => { setNumber(value ? value.toString() : ''); }}
/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

<FormField control={form.control} name="store_owner"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Store Owner Full Name</FormLabel>
                                
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Your Full Name"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        
<FormField control={form.control} name="ownerID"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Store Owner ID</FormLabel>
                                
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="The owners ID NUmber"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


<FormField control={form.control} name="tax_clearance"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Tax Clearance Code</FormLabel>
                                
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="The Tax Clearance for this Shop"
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