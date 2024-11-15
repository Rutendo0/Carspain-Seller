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
import emailjs from 'emailjs-com';

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { deleteObject, ref } from "firebase/storage"
import { Phone, Redo, Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { MouseEventHandler, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { number, z } from "zod"
import Checkbox from "./checkbox"
import { ProductModal } from "@/components/modal/product-modal"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DeleteModal } from "@/components/modal/delete-modal"
import { DeliveryModal } from "@/components/modal/delivery-modal"
import { DeliveredModal } from "@/components/modal/deliver-modal"
import { PaidModal } from "@/components/modal/paidmodal"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { OrderColumns } from "@/app/(dashboard)/(routes)/orders/components/columns"
import { PhoneModal } from "@/components/modal/phone-modal"

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
    store_address: string;
    quantity: number;
    image: string;
    make: string;
    model: string;
    year: number;
    orderId: string,
    productId: string,
    storeaddress:string,
    price: number,
    isPaid: boolean,
    dnumber: string
}



export const OrderPage = ({initialData, userId}: OrderFormProps, ) => {

    

    if(!initialData || initialData.length == 0){
        return <>
        <div className="flex items-center justify-center">
            <h3>No Pending Orders For this Client</h3>
        </div>
        </>
    }

    const name = initialData[0].clientName
    const email = initialData[0].clientEmail

    const [open, setOpen] = useState(false);
    const [Dopen, setDOpen] = useState(false);
    const [Deliveringopen, setDeliveringOpen] = useState(false);
    const [Deliveredopen, setDeliveredOpen] = useState(false);
    const [Paidopen, setPaidOpen] = useState(false);



    const [isLoading, setIsloading] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);
    const [isDelivered, setIsDelivered] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isPaid, setIsPaid] = useState(false);



    const params = useParams()
    const router = useRouter()


    const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);

    let total = 0;

    initialData.forEach(order => {
        order.orderItems.forEach(product => {
            const quantity = product.qty || 0;
            const productTotal = product.price * quantity;
            total += productTotal;
            const productExists = allProducts.some(p => p.productId === product.id);

            if (!productExists) {
                allProducts.push({
                    name: product.name,
                    store_name: order.store_name,
                    store_address: order.store_address,
                    quantity: product.qty || 0,
                    image: product.images[0]?.url || '',
                    make: product.OEM,
                    model: product.model,
                    year: product.year,
                    orderId: order.id,
                    productId: product.id,
                    storeaddress: order.store_address,
                    price: product.price,
                    isPaid: order.isPaid,
                    dnumber: order.dnumber
                });
            }
        });
    });

    let orderIds: string[] = [];

    for(const x of allProducts){
        if(!orderIds.includes(x.orderId)){
            orderIds.push(x.orderId)
        }
    }
    


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


    const [checkedProducts, setCheckedProducts] = useState(
        allProducts.map(() => false)
      );

      useEffect(() => {
        let allChecked = checkedProducts.every(Boolean);
        form.setValue('product_collected', allChecked);
      }, [checkedProducts, form]);

      const handleCheckboxChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
  
        const newCheckedProducts = [...checkedProducts];
        newCheckedProducts[index] = event.target.checked;
        setCheckedProducts(newCheckedProducts);

      };





      const handleDeliveryChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
        const allChecked = checkedProducts.every(product => product === true);

        setDeliveringOpen(allChecked);
        
        if (!allChecked){
            toast.error("Collect all products first")
        }
       

      };










      const handleDeliveredChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const allChecked = checkedProducts.every(product => product === true);



            setDeliveredOpen(allChecked);


           

            if(!allChecked){
            toast.error("Collect All products or decline order")
        }
        
        

      };

      const handlePaidChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Anything");
        const allChecked = checkedProducts.every(product => product === true);

        setPaidOpen(allChecked);
        if(!allChecked) {
            toast.error("Please Collect all Products first")
        }
        

      };

      const delivering = async (status: string) => {
        let data = {}
        data = {
            order_status: status,
            isPaid: false,
            
        }

        try {
            
            await axios.patch(`/api/orders/${userId}`, data);

            toast.success("Order Status Updated")

            emailjs.send("service_miw5uzq", "template_pclaerv", {
                to_email: email,
                message: "Your order is now being Delivered. Track your order online, or contact us for assistance",
                from_name: "Carspian Auto",
                to_name: name
              }, 'NgwZzNEQN_63SAnSw')
              .then((result) => {
              }, (error) => {
                console.log(error.text);
                toast.error('Failed to complete Order. Please contact admin.')})

            setDeliveringOpen(false)
            setIsDelivering(true);
        }
         catch (error) {
            console.log(error)
        }
      }

      const delivered = async (status: string) => {
        let data = {}
        data = {
            order_status: status,
            isPaid: false,
        }

        try {
            
            await axios.patch(`/api/orders/${userId}`, data);

            toast.success("Order Status Updated")

            emailjs.send("service_miw5uzq", "template_pclaerv", {
                to_email: email,
                message: "Your order has been successfully delivered. Please feel free to leave a review for each product you purchased!",
                from_name: "Carspian Auto",
                to_name: name
              }, 'NgwZzNEQN_63SAnSw')
              .then((result) => {
              }, (error) => {
                console.log(error.text);
                toast.error('Failed to complete Order. Please contact admin.')})

            setDeliveredOpen(false)
            setIsDelivered(true);
        }
         catch (error) {
            console.log(error)
        }
      }

      const paid = async (status: string) => {
        let data = {}
        if(isDelivered && isDelivering){
            data = {
                order_status: 'Delivered',
                isPaid: true,
                
            }
        }
        else {
            data = {
                order_status: 'Processing', 
                isPaid: true,
                
            }
        }

        if(isDelivered){
            try {
            
                await axios.patch(`/api/orders/${userId}`, data);
    
                toast.success("Order Status Updated")
    
                setPaidOpen(false)
                setIsPaid(true);
            }
             catch (error) {
                console.log(error)
            }
        }
        else{
            toast.error("Please check Delivered box first")
        }


      }



    // const productsCollected = watch('products').every(product => product.collected);

  



    const completeOrder =async()=>{
        setIsloading(true);



        let data = {
            order_status: "Complete",
            isPaid:  isPaid,
        }

        try {
            
            await axios.patch(`/api/orders/${userId}`, data);

            toast.success("Order Complete")

            emailjs.send("service_miw5uzq", "template_pclaerv", {
                to_email: email,
                message: "Your order has been successfully delivered, paid for and completed. You can still view it under completed orders if you would like to reorder it. ",
                from_name: "Carspian Auto",
                to_name: name
              }, 'NgwZzNEQN_63SAnSw')
              .then((result) => {
              }, (error) => {
                console.log(error.text);
                toast.error('Failed to complete Order. Please contact admin.')})


            setIsloading(false)
            router.refresh();
        }
         catch (error) {
            console.log(error)
        }


    }


    const onSubmit = async (data : z.infer<typeof schema>) => {
        console.log("Big Me");
        if(isPaid){
            completeOrder();
        }
       
            else{
                toast.error("Please confirm products are collected and invoice is paid.")
            }

    }


    const onDeleteOrder = async () => {
        event?.preventDefault();



            setDOpen(true);
    }

    const completeDelete = async () => {
        console.log("Hey!!!!");
        try {

            await axios.delete(`../../api/decline/${userId}`)
            .catch(error => {
                console.error('Error:', error.message);
            });

            // event?.preventDefault();
 

            setDOpen(false)
            router.refresh();
            toast.success("Order deleted Successfully")
            // router.push(`/new`);
            // router.refresh();
            // toast.success("Order Declined");

        } catch (error) {
            toast.error("Problem with declining order")
            console.log(error)
        }
        
    };

    const removeProd = async (id: string, order : string) => {
        event?.preventDefault()
        try {
            setIsloading(true)
            const updatedProducts = allProducts.filter(product => product.productId !== id);
            console.log(allProducts)

            const { data: orderData } = await axios.get(`../../api/orders/single2/${order}`);
            
            // Filter out the product with the matching productId

            const updatedOrderItems = orderData.orderItems.filter((item : Product)  => item.id !== id);

            
            // Update the order with the new orderItems array
            const response = await axios.patch(`../../api/orders/single2/${order}`, {
                orderItems: updatedOrderItems
            });
            if(response.status == 200){
                setAllProducts(updatedProducts);
                setIsloading(false)
                toast.success("Product Removed")
                router.refresh();
                
            }

        } catch (error) {
            console.log(error)
        }


    } 

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success("Phone number copied to clipboard")
     }

     const [Phoneopen, setPhoneOpen] = useState(false);

     const [dnumber, setdnumber] = useState('');

     const phone = async (id: string) => {
        try {
            setIsloading(true)
            console.log(id)
            for (const x of orderIds){
                console.log(x)
                const response = await axios.patch(`../../api/orders/single3/${x}`, {
                    dnumber: id
                });
            }
            setdnumber(id);
            setPhoneOpen(false);
            setIsloading(false);
            toast.success("Number Updated");
            router.refresh
              
        } catch (error) {
            
        }

     }


    

  return <>

<DeleteModal isOpen={Dopen} onClose={() => setDOpen(false)}
        onConfirm={() => completeDelete()} loading={isLoading} useriD={userId} />

        <DeliveryModal isOpen={Deliveringopen} onClose={() => setDeliveringOpen(false)}
        onConfirm={() => delivering("Delivering")} loading={isLoading}/>
                <DeliveredModal isOpen={Deliveredopen} onClose={() => setDeliveredOpen(false)}
        onConfirm={() => delivered("Delivered")} loading={isLoading}/>
                <PaidModal isOpen={Paidopen} onClose={() => setPaidOpen(false)}
        onConfirm={() => paid("Paid")} loading={isLoading}/>





<div className="w-full flex items-center justify-center" onClick={() => onCopy(initialData[0].number)}>
    <Phone className="h-4 w-4 mr-2" />
    Call Client
    </div>


<div className="w-full flex items-center justify-center  cursor-pointer transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110  duration-300" onClick={() => setPhoneOpen(true)}>
    <Redo className="h-4 w-4 mr-2" />
    Set Driver Phone Number
    </div>

    <PhoneModal isOpen={Phoneopen} onClose={() => setPhoneOpen(false)}
        onConfirm={phone} loading={isLoading}/>



    <Form {...form}>
                    <form 
                    className="w-full space-y-8">


                    <div className="container mx-auto p-4 rounded-lg shadow-lg max-h-screen overflow-y-auto">
                        {allProducts.map((product, index) => (
                        <Controller
                            key={product.productId}
                            disabled={isLoading}
                            name={`product`}
                            control={form.control}
                            render={({ field }) => (
                            <Card className="mb-4">

                                <CardContent>
                                    <FormLabel className="mr-10"
                                    >{product.name} , {product.make} {product.model}</FormLabel>
                                    <div className="float-right mt-5">
                                        <Checkbox
                                        checked={checkedProducts[index]}
                                        onChange={handleCheckboxChange(index)}
                                        />
                                        <Button className="ml-4" onClick={() => {
                                            removeProd(product.productId, product.orderId)
                                        
                                        }}>
                                        <Trash className="w-4 h-4" />
                                        </Button>
                                        
                                    </div>

                                    <Collapsible>
                                    <CollapsibleTrigger className="text-gray-500 cursor-pointer hover:text-blue-500"> Click for Details</CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <FormLabel className="mr-10">Store:</FormLabel>
                                        <FormLabel className="mr-10">{product.store_name}</FormLabel>
                                        <FormLabel className="mr-10">Store Adress: </FormLabel>
                                        <FormLabel className="mr-10">{product.store_address}</FormLabel>
                                        <br />
                                        <FormLabel className="mr-10">{product.year}</FormLabel>
                                        <FormLabel className="mr-10">Quantity: ${product.quantity}</FormLabel>
                                        <FormLabel className="mr-10">Price: ${product.price}</FormLabel>
                                        <FormLabel className="mr-10">Total: ${product.price * product.quantity}</FormLabel>
                                    </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                      
                            </Card>
                            )}
                        />
                        ))}
                    </div>


                    <div className="container flex flex-col items-center mx-auto p-4 rounded-lg shadow-lg">

                        <FormField  control={form.control} name="delivering"
                        render={({field}) => (
                            <FormItem className="mb-3">
                                <FormLabel className="mr-10">Delivering</FormLabel>
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
                            <FormItem className="mb-3">
                                <FormLabel className="mr-10">Delivered</FormLabel>
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
                            <FormItem className="mb-3">
                                <FormLabel className="mr-10">Invoice Paid</FormLabel>
                                <FormControl>
                                    <Checkbox 
                                                    checked={isPaid}
                                                    onChange={handlePaidChange()}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>


                            <h2 className="mb-3">The Total for the Invoice is: ${total}</h2>
                    
                            <Button className="mb-3 lg:bg-red-500 lg:hover:bg-red-700 lg:cursor-pointer lg:transition lg:duration-500" size={"lg"} onClick={onDeleteOrder}
                            >Decline Order
                            </Button>
                            <Button className="mb-3 lg:bg-blue-500 lg:hover:bg-blue-700 lg:cursor-pointer lg:transition lg:duration-500" disabled={isLoading} size={"lg"} type="submit" 
                            >Confirm Order Completion
                            </Button>

                    </div>
                
                    </form>
                </Form>
                

<footer className="mx-auto  fixed bottom-3 left-10 text-gray-500">
    2024 Developed by <a href="https://gorillaresearch.net">GRI</a>
</footer>
  </>
}
