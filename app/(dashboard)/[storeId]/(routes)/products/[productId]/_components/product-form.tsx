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
import { db } from "@/lib/firebase"
import { Brand, Category, Industry, Model, Part, Product } from "@/types-db"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { collection, getDocs } from "firebase/firestore"
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
    initialData: Product | null;
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
    category: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().min(1),
    stock: z.coerce.number().int(),
    year: z.coerce.number().int().max(2024).min(1950),
});

export const ProductForm = ({initialData, industries, parts}: ProductFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ?? {
            name: "",
            price: 0,
            Code: "",
            images: [],
            isFeatured: false,
            isArchived: false,
            category: "",
            brand: "",
            model: "",
            stock: 1,
            year: 1950,
        }
    });

    const [isLoading, setIsloading] = useState(false);
    const [open, setOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const [averagePrice, setAveragePrice] = useState<number | null>(null);
    const [showAveragePrice, setShowAveragePrice] = useState(false);
    const [holders, setHolders] = useState<Model[]>([]);
    const [maker, setMaker] = useState('');
    const [codec, setCode] = useState('');
    const [imageurl, setimageurl] = useState('');
    const [currentYear, setCurrentYear] = useState(0);
    const [product, setProduct] = useState<Product | null>(null);
    const invalidModelCount = parts.filter(part => part.Model && part.Model.trim() !== "" && part.PartCode != "");
    const [partHolder, setPartHolder] = useState<Part[]>(invalidModelCount);
    const make = parts[0].Make;

    const title = initialData ? "Edit Product" : "Create Product";
    const description = initialData ? "Edit product details" : "Add a new product to your inventory";
    const toastMessage = initialData ? "Product updated successfully" : "Product created successfully";
    const action = initialData ? "Save Changes" : "Create Product";

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsloading(true);
            data.images = [{ url: imageurl }];

            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }
            
            toast.success(toastMessage);
            router.refresh();
            router.push(`/${params.storeId}/products`);
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            router.refresh();
            setIsloading(false);
        }
    }

    const onDelete = async () => {
        try {
            setIsloading(true);
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
            toast.success("Product removed successfully");
            router.refresh();
            router.push(`/api/${params.storeId}/products`);
        } catch (error) {
            toast.error("An error occurred while deleting the product");
        } finally {
            setIsloading(false);
            setOpen(false);
        }
    }

    const calculateAveragePrice = async (partCode: string, model: string, category: string, partName: string) => {
        try {
            const storesSnapshot = await getDocs(collection(db, "stores"));
            let totalPrice = 0;
            let productCount = 0;
    
            for (const storeDoc of storesSnapshot.docs) {
                const productsSnapshot = await getDocs(collection(storeDoc.ref, "products"));
                
                productsSnapshot.forEach(productDoc => {
                    const productData = productDoc.data() as Product;
                    if (productData.OEM === partCode && 
                        productData.model === model && 
                        productData.category === category && 
                        productData.name === partName) {
                        totalPrice += productData.price;
                        productCount++;
                    }
                });
            }
    
            if (productCount > 0) {
                const averagePrice = totalPrice / productCount;
                setAveragePrice(averagePrice);
                setShowAveragePrice(true);
                return averagePrice;
            }
            setAveragePrice(null);
            setShowAveragePrice(false);
            return null;
        } catch (error) {
            console.error("Error calculating average price:", error);
            setAveragePrice(null);
            setShowAveragePrice(false);
            return null;
        }
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <Heading title={title} description={description} />
                    {showAveragePrice && averagePrice && (
                        <div className="bg-indigo-600 text-white p-3 rounded-md mt-4 text-center shadow-sm">
                            <span className="font-medium">Market Average Price:</span> ${averagePrice.toFixed(2)}
                        </div>
                    )}
                </div>
                {initialData && (
                    <Button
                        disabled={isLoading}
                        variant={"destructive"}
                        size={"icon"}
                        onClick={() => setOpen(true)}
                        className="hover:scale-105 transition-transform"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Separator className="bg-indigo-100" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Image Preview */}
                        <div className="col-span-full flex items-start gap-6">
                            <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-indigo-100 shadow-sm">
                                <Image 
                                    src={imageurl || "/placeholder-product.jpg"} 
                                    fill 
                                    alt="Product preview" 
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-indigo-800 font-medium">Product Image</FormLabel>
                                            <FormDescription className="text-sm text-gray-500">
                                                Image will update automatically when part code is selected
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Make Selection */}
                        <FormField 
                            control={form.control} 
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Make</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={(e) => {
                                            setMaker(e);
                                            setPartHolder(partHolder.filter(item => item.Make === e));
                                            field.onChange(e);
                                        }}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="hover:border-indigo-300 focus:ring-indigo-200">
                                                <SelectValue placeholder="Select vehicle make" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-indigo-50 shadow-lg">
                                            <SelectItem key="0" value={make} className="hover:bg-indigo-50">
                                                {make}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Model Selection */}
                        <FormField 
                            control={form.control} 
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Model</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={(e) => {
                                            setPartHolder(partHolder.filter(item => item.Model.replace(/,$/, '') === e));
                                            field.onChange(e);
                                        }}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="hover:border-indigo-300 focus:ring-indigo-200">
                                                <SelectValue placeholder="Select vehicle model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-indigo-50 shadow-lg">
                                            {Array.from(new Set(partHolder.map(item => item.Model.replace(/,$/, ''))))
                                                .map((model, index) => (
                                                    <SelectItem 
                                                        key={index} 
                                                        value={model}
                                                        className="hover:bg-indigo-50"
                                                    >
                                                        {model}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Selection */}
                        <FormField 
                            control={form.control} 
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Category</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={(e) => {
                                            setPartHolder(partHolder.filter(item => item.Category === e));
                                            field.onChange(e);
                                        }}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="hover:border-indigo-300 focus:ring-indigo-200">
                                                <SelectValue placeholder="Select part category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-indigo-50 shadow-lg">
                                            {Array.from(new Set(partHolder.map(item => item.Category)))
                                                .map((category, index) => (
                                                    <SelectItem 
                                                        key={index} 
                                                        value={category}
                                                        className="hover:bg-indigo-50"
                                                    >
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Part Name Selection */}
                        <FormField 
                            control={form.control} 
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Part Name</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={(e) => {
                                            field.onChange(e);
                                            setPartHolder(partHolder.filter(item => item.Name === e));
                                        }}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="hover:border-indigo-300 focus:ring-indigo-200">
                                                <SelectValue placeholder="Select part name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-indigo-50 shadow-lg">
                                            {Array.from(new Set(partHolder.map(item => item.Name)))
                                                .map((name, index) => (
                                                    <SelectItem 
                                                        key={index} 
                                                        value={name}
                                                        className="hover:bg-indigo-50"
                                                    >
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Part Code Selection */}
                        <FormField 
                            control={form.control} 
                            name="Code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Part Code</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={async (e) => {
                                            field.onChange(e);
                                            setPartHolder(partHolder.filter(item => item.PartCode === e));
                                            setimageurl(`https:${partHolder[0].Photo}`);
                                            
                                            const test = partHolder.find(item => item.PartCode === e);
                                            if (test) {
                                                setCurrentYear(test?.Year);
                                            }
                                            
                                            const currentValues = form.getValues();
                                            if (currentValues.model && currentValues.category && currentValues.name && e) {
                                                await calculateAveragePrice(
                                                    e, 
                                                    currentValues.model, 
                                                    currentValues.category, 
                                                    currentValues.name
                                                );
                                            }
                                        }}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="hover:border-indigo-300 focus:ring-indigo-200">
                                                <SelectValue placeholder="Select part code" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-indigo-50 shadow-lg">
                                            {partHolder.map(item => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={item.PartCode}
                                                    className="hover:bg-indigo-50"
                                                >
                                                    {item.PartCode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price Input */}
                        <FormField 
                            control={form.control} 
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Price ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number" 
                                            disabled={isLoading}
                                            placeholder="Enter price"
                                            className="focus:ring-indigo-200 border-indigo-100"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Year Display */}
                        <FormField 
                            control={form.control} 
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Year</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number" 
                                            disabled={true}
                                            value={currentYear}
                                            className="bg-indigo-50 border-indigo-100 text-indigo-800"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Stock Level */}
                        <FormField 
                            control={form.control} 
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-indigo-800 font-medium">Stock Level</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            disabled={isLoading}
                                            placeholder="Enter stock quantity"
                                            className="focus:ring-indigo-200 border-indigo-100"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Featured Checkbox */}
                        <FormField 
                            control={form.control} 
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-indigo-100 bg-indigo-50">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-indigo-300 data-[state=checked]:bg-indigo-600"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-indigo-800 font-medium">Featured Product</FormLabel>
                                        <FormDescription className="text-sm text-indigo-600">
                                            This product will be highlighted in your store
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Archived Checkbox */}
                        <FormField 
                            control={form.control} 
                            name="isArchived"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-indigo-100 bg-indigo-50">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-indigo-300 data-[state=checked]:bg-indigo-600"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-indigo-800 font-medium">Archived</FormLabel>
                                        <FormDescription className="text-sm text-indigo-600">
                                            This product will be hidden from your store
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/${params.storeId}/products`)}
                            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            {isLoading ? "Processing..." : action}
                        </Button>
                    </div>
                </form>
            </Form>

            <AlertModal 
                isOpen={open} 
                onClose={() => setOpen(false)}
                onConfirm={onDelete} 
                loading={isLoading}
            />
        </div>
    );
};