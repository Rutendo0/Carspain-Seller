"use client"
import { Heading } from "@/components/heading"
import { AlertModal } from "@/components/modal/alert-modal"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { storage } from "@/lib/firebase"
import { Order, Product } from "@/types-db"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { deleteObject, ref } from "firebase/storage"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import Checkbox from "./checkbox"
import { ProductModal } from "@/components/modal/product-modal"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteModal } from "@/components/modal/delete-modal"

interface OrderFormProps {
    initialData: Order[];
    userId: string;
}

const schema = z.object({
    product_collected: z.boolean().refine(val => val === true, {
      message: "You must collect all the products",
    }),
    delivering: z.boolean(),
    delivered: z.boolean(),
    declined: z.boolean(),
    paid: z.boolean(),
    product: z.boolean(),
  });
  
  interface ProductSummary {
    name: string;
    store_name: string;
    quantity: number;
    image: string;
    make: string;
    model: string;
    year: number;
    orderId: string,
    productId: string,
    price: number
}


export const OrderPage = ({initialData, userId}: OrderFormProps, ) => {

    if(initialData.length == 0){
        return <>
        <div className="flex items-center justify-center">
            <h3>No Pending Orders For this Client</h3>
        </div>
        </>
    }


    const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);

    let total = 0;

    initialData.forEach(order => {
        order.orderItems.forEach(product => {
            const quantity = product.qty || 0;
            const productTotal = product.price * quantity;
            total += productTotal;
            allProducts.push({
                name: product.name,
                store_name: order.store_name,
                quantity: product.qty || 0,
                image: product.images[0]?.url || '',
                make: product.OEM,
                model: product.model,
                year: product.year,
                orderId: order.id,
                productId: product.id,
                price: product.price
            });
        });
    });

    let orderIds: string[] = [];

    allProducts.forEach(element => {
        if(!orderIds.includes(element.orderId)){
            orderIds.push(element.orderId)
        }
    });

    console.log(orderIds);
    


    const [isLoading, setIsloading] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);
    const [isDelivered, setIsDelivered] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            product_collected: false,
            delivering: false,
            delivered: false,
            declined: false,
            paid: false,
            product: false,
          },
    });
    let allChecked = false;


    const [checkedProducts, setCheckedProducts] = useState(
        allProducts.map(() => false)
      );

      useEffect(() => {
        allChecked = checkedProducts.every(Boolean);
        form.setValue('product_collected', allChecked);
      }, [checkedProducts, form]);

      const handleCheckboxChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpen(true);
        console.log("ignored")
        const newCheckedProducts = [...checkedProducts];
        newCheckedProducts[index] = event.target.checked;
        setCheckedProducts(newCheckedProducts);

      };

      const handleDeliveryChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        if(allChecked){
            let orderIds: string[] = [];
            allProducts.forEach(element => {
                orderIds.push(element.orderId)
            });
    
            setIsloading(true);
            setOpen(true);
            let data = {};
            if(event.target.checked){
                data = {
                    order_status: "Delivering"
                }
            }
            else {
                data = {
                    order_status: "Processing"
                }
                setIsDelivering(false);
            }
            try{
                for(const orderID in orderIds){
                    await axios.patch(`/api/orders/${orderID}`, data);
                }
                toast.success("Order Status Updated")
            }
            catch(error){
                console.log("Failure")
            }
        }
        else{
            toast.error("Collect all products first")
        }
       

      };


      const handleDeliveredChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        if(allChecked){
            let orderIds: string[] = [];
            allProducts.forEach(element => {
                orderIds.push(element.orderId)
            });
            setIsloading(true);
            setOpen(true);
            let data = {};
            if(event.target.checked){
                data = {
                    order_status: "Delivered"
                }
            }
            else {
                data = {
                    order_status: "Processing"
                }
                setIsDelivered(false)
            }
            try{
                for(const orderID in orderIds){
                    await axios.patch(`/api/orders/${orderID}`, data);
                }
                toast.success("Order Status Updated")
            }
            catch(error){
                console.log("Failure")
            }
        }
        else{
            toast.error("Collect All products or decline order")
        }
        
        

      };

      const handlePaidChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        if(allChecked){
            let orderIds: string[] = [];
            allProducts.forEach(element => {
                orderIds.push(element.orderId)
            });
            setIsloading(true);
            setOpen(true);
            let data = {};
            if(event.target.checked){
                data = {
                    order_status: "Paid"
                }
            }
            else {
                data = {
                    order_status: "Processing"
                }
                setIsPaid(false)
            }
            try{
                for(const orderID in orderIds){
                    await axios.patch(`/api/orders/${orderID}`, data);
                }
                toast.success("Order Status Updated")
            }
            catch(error){
                console.log("Failure")
            }
        }
        else {
            toast.error("Please Collect all Products first")
        }
        

      };
    // const productsCollected = watch('products').every(product => product.collected);

  

    const [open, setOpen] = useState(false);
    const [Dopen, setDOpen] = useState(false);
    const params = useParams()
    const router = useRouter()



    
  


    const onSubmit = async (data : z.infer<typeof schema>) => {
        try {
            setIsloading(true);

            if(isPaid && data.product_collected){
                let orderIds: string[] = [];
                allProducts.forEach(element => {
                    orderIds.push(element.orderId)
                });
    
                let data = {
                    order_status: "Complete"
                }

                try{
                    for(const orderID in orderIds){
                        await axios.patch(`/api/orders/${orderID}`, data);
                    }
                    toast.success("Order Status Updated")
                }
                catch(error){
                    console.log("Failure")
                }
            }
            else{
                toast.error("Please confirm products are collected and invoice is paid.")
            }



            toast.success("Store Updated");
            router.push(`/driver-portal`)
            router.refresh();



        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    const onDeleteProduct = async(productId: string) => {
        // try {
        //     setIsloading(true);

        //     const updatedProducts = allProducts.filter(product => product.productId !== productId);
        //     const removed = allProducts.filter(product => product.productId === productId);
        //     removed.forEach(element => {
        //         total -= (element.quantity * element.price)
                
        //     });
        //     let orderIds: string[] = [];
        //     for(const product in rem){
        //         await axios.patch(`/api/orders/${orderID}`, data);
        //     }
        //     await axios.delete(`/api/${params.storeId}/category/${params.categoryId}`);

        //     setAllProducts(updatedProducts);


            


        //     toast.success("Category Removed");
        //     router.refresh();
        //     router.push(`/api/${params.storeId}/categories`);


        // } catch (error) {
        //     toast.error("Something went wrong");
        // }
        // finally{
        //     setIsloading(false)
        //     setOpen(false);
        // }
    }
    const onDeleteOrder = async () => {
        try {

            setDOpen(true);

            if(!setDOpen){
                for(const x of orderIds){
                    await axios.delete(`/api/orders/single/${x}`);
                }
                toast.success("Order deleted, Goodbye")
                router.push(`/new`);
                router.refresh();
            }

            // toast.success("Order Declined");
            // for(const x of orderId){
            //     await axios.delete(`/api/orders/single/${x}`);
            // }




        } catch (error) {
            toast.error("Something went wrong");
        }
        finally{
            setIsloading(false)
            setOpen(false);
        }
    }


  return <>
      <ProductModal isOpen={open} onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)} loading={isLoading}/>
        <DeleteModal isOpen={Dopen} onClose={() => setDOpen(false)}
        onConfirm={() => setDOpen(false)} loading={isLoading} useriD={userId} />


    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} 
                    className="w-full space-y-8">
                        <div className="flex justify-center items-center h-screen">
                    <div className="overflow-y-scroll h-[60vh] w-[60vw] shadow-lg p-4 rounded-md
                    p-10 scroll-p-25">
                    {allProducts.map((product, index) => (

                            <Controller
                            
                            key={product.productId}
                            disabled={isLoading}
                            name={`product`}
                            control={form.control}
                            render={({ field }) => (

                                <div className="w-full flex items-center justify-between rounded border shadow p-2 mt-2" >
                                <FormLabel className="mr-10">{product.name}</FormLabel>
                                <FormLabel className="mr-10">{product.store_name}</FormLabel>
                                <FormLabel className="mr-10">{product.make}</FormLabel>
                                <FormLabel className="mr-10">{product.model}</FormLabel>
                                <FormLabel className="mr-10">{product.year}</FormLabel>
                                <Checkbox
                                                checked={checkedProducts[index]}
                                                onChange={handleCheckboxChange(index)}
                                                
                                                />
                                                 
                                </div>
                            )}
                            />
                        ))}
                        
                        </div></div>
                        

                        <FormField control={form.control} name="delivering"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Delivering</FormLabel>
                                <FormControl>
                                    <Checkbox 
                                                    checked={isDelivering}
                                                    onChange={handleDeliveryChange()}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="delivered"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Delivered</FormLabel>
                                <FormControl>
                                    <Checkbox 
                                                    checked={isDelivered}
                                                    onChange={handleDeliveredChange()}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>



                        <FormField control={form.control} name="paid"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Invoice Paid</FormLabel>
                                <FormControl>
                                    <Checkbox 
                                                    checked={isPaid}
                                                    onChange={handlePaidChange()}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                            <h2>The Total for the Invoice is: ${total}</h2>
                    
                            <Button  size={"lg"} onClick={async ()=> {
                                onDeleteOrder()
                            }}
                            >Decline Order
                            </Button>
                            <Button disabled={isLoading} size={"lg"} type="submit"
                            >Confirm Order Completion
                            </Button>

                    </form>
                </Form>
                


  </>
}
