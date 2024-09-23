"use client"

import { Heading } from "@/components/heading";
import { DeleteModal } from "@/components/modal/delete-modal";
import { ProductModal } from "@/components/modal/product-modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Order } from "@/types-db";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod"

interface FixFormProps {
    initialData: Order[];
    userId: string;
}


const schema = z.object({
    product_collected: z.boolean(),
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


export const FixPage = ({initialData, userId}: FixFormProps, ) => {

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

    const [isLoading, setIsloading] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);
    const [isDelivered, setIsDelivered] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const [open, setOpen] = useState(false);
    const [Dopen, setDOpen] = useState(false);



    const handleDeliveryChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("deliver")

    
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
                    axios.patch(`/api/orders/${orderID}`, data);
                }
                toast.success("Order Status Updated")
            }
            catch(error){
                console.log("Failure")
            }

       

      };


      const handleDeliveredChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Hey!");


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

        
        

      };

      const handlePaidChange = () => async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Anything");

            
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

      };

    const hey = () => {
        setDOpen(true);
    };



    return <>
    <ProductModal isOpen={open} onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)} loading={isLoading}/>
      <DeleteModal isOpen={Dopen} onClose={() => setDOpen(false)}
      onConfirm={() => setDOpen(false)} loading={isLoading} useriD={userId} />


  {/* <Form {...form}>
                  <form 
                  className="w-full space-y-8">
                    </form>
                    </Form> */}
                    <Button onClick={hey}>Hey</Button>

                    </>

}