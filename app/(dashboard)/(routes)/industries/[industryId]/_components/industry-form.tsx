"use client"
import { Heading } from "@/components/heading"
import { AlertModal } from "@/components/modal/alert-modal"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {  Industry } from "@/types-db"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { deleteObject, ref } from "firebase/storage"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface IndustryFormProps {
    initialData: Industry;
}

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
});



export const IndustryForm = ({initialData}: IndustryFormProps) => {



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const [isLoading, setIsloading] = useState(false);
    const [open, setOpen] = useState(false);
    const params = useParams()
    const router = useRouter()
  

    const title = initialData ? "Edit Industry" : "Create Industry";
    const description = initialData ? "Edit a Industry" : "Create a new Industry";
    const toastMessage = initialData ? "Industry Updated" : "Created Industry";
    const action = initialData ? "Save Changes" : "Create Industry";


    const onSubmit = async (data : z.infer<typeof formSchema>) => {
        try {
            setIsloading(true);




            if(initialData){
                await axios.patch(`/api/industries/${params.industryId}`, data);
            }
            else {
                await axios.post(`/api/industries`, data);

            }
            toast.success("Industry Updated");
            router.refresh();
            router.push(`/industries`)



        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            router.refresh();
            setIsloading(false)
        }
    }

    const onDelete = async() => {
        try {
            setIsloading(true);

            await axios.delete(`/api/industries/${params.industryId}`);


            toast.success("Industry Removed");
            router.refresh();
            router.push(`/industries`);


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
    <div className="flex items-center justify-center">
        <Heading title={title} description={description}/>
        {initialData && 
            <Button
            disabled={isLoading}
            variant={"destructive"} size={"icon"}
            onClick={()=>setOpen(true)}>
                <Trash className="h-4 w-4"/>
            </Button>
        }

    </div>

    <Separator/>

    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} 
                    className="w-full space-y-8">
                        
                        <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="The Industry Name"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                        <FormField control={form.control} name="value"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Specification</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Sub-Industry"
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
