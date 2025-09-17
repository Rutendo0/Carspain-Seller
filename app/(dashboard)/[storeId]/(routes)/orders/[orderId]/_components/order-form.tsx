"use client"

import { Heading } from "@/components/heading"
import { AlertModal } from "@/components/modal/alert-modal"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Order } from "@/types-db"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface OrderFormProps {
    initialData: Order;
}

const formSchema = z.object({
    phone: z.string().min(1),
    address: z.string().min(1),
    order_status: z.string().min(1),
});

export const OrderForm = ({initialData}: OrderFormProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: initialData.phone,
            address: initialData.address,
            order_status: initialData.order_status,
        }
    });

    const [isLoading, setIsloading] = useState(false);
    const [open, setOpen] = useState(false);
    const params = useParams()
    const router = useRouter()
  
    const title = "View Order Details";
    const description = "View order information";
    const action = "Update Order";

    const onSubmit = async (data : z.infer<typeof formSchema>) => {
        try {
            setIsloading(true);

            await axios.patch(`/api/${params.storeId}/orders/${params.orderId}`, data);

            toast.success("Order Updated");
            router.refresh();
            router.push(`/${params.storeId}/orders`)
        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
        }
    }

    const onDelete = async() => {
        try {
            setIsloading(true);

            await axios.delete(`/api/${params.storeId}/orders/${params.orderId}`);

            toast.success("Order Removed");
            router.refresh();
            router.push(`/${params.storeId}/orders`);

        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
            setOpen(false);
        }
    }

  return <>
    <AlertModal isOpen={open} onClose={() => setOpen(false)}
        onConfirm={onDelete} loading={isLoading}/>
    <div className="flex items-center justify-between">
        <Heading title={title} description={description}/>
        <Button
        disabled={isLoading}
        variant={"destructive"} size={"icon"}
        onClick={()=>setOpen(true)}>
            <Trash className="h-4 w-4"/>
        </Button>
    </div>

    <Separator/>

    <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} 
                className="w-full space-y-8">
                    
                    <div className="grid grid-cols-3 gap-8">
                    <FormField control={form.control} name="phone"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading}
                                placeholder="Phone number"
                                {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="address"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading}
                                placeholder="Delivery address"
                                {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="order_status"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading}
                                placeholder="Order status"
                                {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    
                </div>
                    <Button disabled={isLoading} type="submit" size={"sm"}
                    >Save Changes
                    </Button>

                </form>
            </Form>
            
  </>
}