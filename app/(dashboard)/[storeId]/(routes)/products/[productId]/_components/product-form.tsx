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
import {  Brand, Category, Industry, Model, Part, Product } from "@/types-db"
import { auth } from "@clerk/nextjs/server"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { deleteObject, ref } from "firebase/storage"
import { Trash } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { type } from "os"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

interface ProductFormProps {
    initialData: Product;
    parts: Part[];
    industries: Industry[];
}

const formSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(1),
    Code: z.string().min(1),
    images: z.object({url: z.string()}).array(),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
    category:  z.string().min(1),
    industry:  z.string().min(1),
    brand:  z.string().min(1),
    model:  z.string().min(1),
    stock: z.coerce.number().int(),
    year: z.coerce.number().int().max(2024).min(1950),
});



export const ProductForm = ({initialData, 
    industries, parts
}: ProductFormProps) => {





    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            price: 0,
            Code: "",
            images: [],
            isFeatured: false,
            isArchived: false,
            category:  "",
            industry:  "",
            brand:  "",
            model:  "",
            stock: 1,
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

     

            data.images = [{ url: imageurl }];


            if(initialData){
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            }
            else {
                console.log(data)
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

    var [maker, setMaker] = useState('')
    var [codec, setCode] = useState('')
    var [imageurl, setimageurl] = useState('')
    var [currentYear, setCurrentYear] = useState(0)
    // Initialize the state with a Product type 
    const [product, setProduct] = useState<Product | null>(null);
    
    const invalidModelCount = parts.filter(part => part.Model && part.Model.trim() !== "" && part.PartCode != "");
    const [partHolder, setPartHolder] = useState<Part[]>(invalidModelCount)
    const make = parts[0].Make;


    console.log(invalidModelCount.length)
    



 


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
                        <FormField
                        control={form.control}
                        name="images"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Product Image</FormLabel>
                                <FormControl>

                                    <div className="w-24 h-24 relative ">

                                    <Image  src={imageurl}  fill alt="product-image" className="shadow-md rounded-md" /></div>
                                </FormControl>
                            </FormItem>
                        )}
                        />

                    <div className="grid grid-cols-3 gap-8">
                    
                    <FormField control={form.control} name="brand"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Make</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={(e) => {
                                        setMaker(e)

                                 
                                        setPartHolder(partHolder.filter(item => item.Make === e))
                                           
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
                                    <SelectItem key="0" value={make}>
                                        {make}
                                    </SelectItem>
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
                                    onValueChange={(e) => {

                                        setPartHolder(partHolder.filter(item => item.Model.replace(/,$/, '') === e))
                                        console.log(partHolder.length)
                                           
                                        field.onChange(e)
                                    }}
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
                                            {Array.from(new Set(partHolder.map(item => item.Model.replace(/,$/, '')))) .map((model, index) => ( <SelectItem key={index} value={model} > {model} </SelectItem> ))}
                                            </SelectContent>
                                        
                                    </Select>
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
                                    onValueChange={(e) => {
                                        setPartHolder(partHolder.filter(item => item.Category === e))
                                        field.onChange(e)
                                    }}
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
                                            {Array.from(new Set(partHolder.map(item => item.Category))) 
                                            .map((model, index) => ( <SelectItem key={index} value={model} > {model} </SelectItem> ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                        <FormField control={form.control} name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Part Name</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={(e) => {
                                        field.onChange(e)
                                        setPartHolder(partHolder.filter(item => item.Name === e))
                                    }}

                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Part" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                            {Array.from(new Set(partHolder.map(item => item.Name))) .map((model, index) => ( <SelectItem key={index} value={model} > {model} </SelectItem> ))}
                                            </SelectContent>
                                        
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                <FormField control={form.control} name="Code"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Part Code</FormLabel>
                                <FormControl>
                                    <Select
                                    disabled={isLoading}
                                    onValueChange={(e) => {
                                        setPartHolder(partHolder.filter(item => item.PartCode === e))
                                        setimageurl(`https:${partHolder[0].Photo}`)
                                        console.log(partHolder[0].Photo)

                                        const test = partHolder.find(item => item.PartCode === e)
                                        if(test){
                                            setCurrentYear(test?.Year)
                                        }
                                        // console.log(hold)
                                        field.onChange(e)
                                    }}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Part Code" />
                                            </SelectTrigger>
                                        </FormControl>
                                            <SelectContent>
                                                {partHolder
                                  
                                                .map(item => (
                                                    <SelectItem
                                                    key={item.id}
                                                    value={item.PartCode}>
                                                        {item.PartCode}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        
                                    </Select>
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

                        <FormField control={form.control} name="year"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input
                                    type="number" disabled={true}
                                    placeholder="production year.."
                                    value={currentYear}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                    <FormField control={form.control} name="stock"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Stock Level</FormLabel>
                                <FormControl>
                                    <Input type="number" disabled={isLoading}
                                    placeholder="Stock levels"
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
                                        This product is one of your key sellers, and will be prioritized over non-featured products
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
                                    This product is currently not available for re-stocking but is part of your product line
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

