"use client"
import { Heading } from "@/components/heading"
import ImagesUpload from "@/components/images-upload"
import { AlertModal } from "@/components/modal/alert-modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {  Brand, Category, Industry, Model, Product } from "@/types-db"
import { auth } from "@clerk/nextjs/server"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { deleteObject, ref } from "firebase/storage"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { type } from "os"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface ProductFormProps {
    initialData: Product;
    categories: Category[];
    industries: Industry[];
    brands: Brand[];
    models: Model[];
}

const formSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(1),
    OEM: z.string().min(1),
    images: z.object({url: z.string()}).array(),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
    category:  z.string().min(1),
    industry:  z.string().min(1),
    brand:  z.string().min(1),
    model:  z.string().min(1),
    year: z.coerce.number().int().max(2024).min(1950),
});



export const ProductForm = ({initialData, categories,
    industries, models, brands
}: ProductFormProps) => {



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            price: 0,
            OEM: "",
            images: [],
            isFeatured: false,
            isArchived: false,
            category:  "",
            industry:  "",
            brand:  "",
            model:  "",
            year:1950,
        }
    });

    const [isLoading, setIsloading] = useState(false);
    const [isSet, setIsSet] = useState(true);
    const [open, setOpen] = useState(false);
    const params = useParams()
    const router = useRouter()





  

    const title = initialData ? "Edit Product" : "Create Product";
    const description = initialData ? "Edit a Product" : "Create a new Product";
    const toastMessage = initialData ? "Product Updated" : "Created Product";
    const action = initialData ? "Save Changes" : "Create Product";


    const onSubmit = async (data : z.infer<typeof formSchema>) => {
        try {
            setIsloading(true);




            if(initialData){
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            }
            else {
                await axios.post(`/api/${params.storeId}/products`, data);

            }
            toast.success("Product Updated");
            router.refresh();
            router.push(`/${params.storeId}/products`)



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

            await axios.delete(`/api/${params.storeId}/products/${params.productId}`);


            toast.success("Product Removed");
            router.refresh();
            router.push(`/api/${params.storeId}/products`);


        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
            setOpen(false);
        }
    }

    var [holders, setHolders] = useState<Model[]>([])



    function onSwitch(value: string) {
        // Your logic here
        const updatedHolders = models.filter(model => model.brandLabel === value);
        console.log(updatedHolders);
        setHolders(updatedHolders);
        // Add more code to handle the switch value as needed
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


                        {/* Images */}
                        <FormField
                        control={form.control}
                        name="images"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Product Images</FormLabel>
                                <FormControl>
                                    <ImagesUpload
                                    value={field.value.map(image => image.url)}
                                    onChange={(urls) => {
                                        field.onChange(urls.map((url) =>({url})))
                                    }}
                                    onRemove={(url) =>{
                                        field.onChange(
                                            field.value.filter((current) => current.url !== url)
                                        );
                                    }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />




                        
                        <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="The product Name"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                        <FormField control={form.control} name="price"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                    type="number" disabled={isLoading}
                                    placeholder="product price.."
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="category"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                                {categories.map(item => (
                                                    <SelectItem
                                                    key={item.id}
                                                    value={item.name}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>




                        <FormField control={form.control} name="industry"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select an Industry" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                                {industries.map(item => (
                                                    <SelectItem
                                                    key={item.id}
                                                    value={`${item.name} - ${item.value}`}>
                                                        {`${item.name} - ${item.value}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>





                        <FormField control={form.control} name="brand"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={(e) => {
                                        onSwitch(e)
                                        field.onChange(e)
                                    }}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Brand" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                                {brands.map(item => (
                                                    <SelectItem
                                                    key={item.id}
                                                    value={item.name}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>



                        <FormField control={form.control} name="model"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Model" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                                {holders.map(item => (
                                                    <SelectItem
                                                    key={item.id}
                                                    value={item.name}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>













                        <FormField control={form.control} name="year"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input
                                    type="number" disabled={isLoading}
                                    placeholder="production year.."
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>



                        <FormField control={form.control} name="OEM"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>OEM ID</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading}
                                    placeholder="Product OEM"
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>



                        <FormField control={form.control} name="isFeatured"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-start space-x-3 
                            space-y-0 rounded-md border p-3">
                                <FormControl>
                                    <Checkbox checked={field.value}
                                    onCheckedChange={field.onChange}/>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Featured</FormLabel>
                                    <FormDescription>
                                        This product will be on home screen under featured products
                                    </FormDescription>
                                </div>
                                
                            </FormItem>
                        )}/>



                    <FormField control={form.control} name="isArchived"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-start space-x-3 
                            space-y-0 rounded-md border p-3">
                                <FormControl>
                                    <Checkbox checked={field.value}
                                    onCheckedChange={field.onChange}/>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Archived</FormLabel>
                                    <FormDescription>
                                        This product will not be on display.
                                    </FormDescription>
                                </div>
                                
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
