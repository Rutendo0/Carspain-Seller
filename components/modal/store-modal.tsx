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

const formSchema = z.object({
    name: z.string().min(3,{message:"Store name should be atleast 3 characters"})
})

export const StoreModal = () => {
    const storeModal = useStoreModal();

    const [isLoading, setIsloading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    const onSumbit = async (values: z.infer<typeof formSchema>) =>{
        try {
            setIsloading(true);
            const response = await axios.post("/api/stores", values);
            toast.success("Store Create");
            window.location.assign(`/${response.data.id}`)


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
        }
    };

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