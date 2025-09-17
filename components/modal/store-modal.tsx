"use client"

import { z } from "zod";
import { Modal } from "../modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import 'react-phone-number-input/style.css'
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios"
import toast from "react-hot-toast";
import PhoneInput from 'react-phone-number-input'


const formSchema = z.object({
  name: z.string().min(3, { message: "Store name must be at least 3 characters" }),
  address: z.string().min(3, { message: "Store address must be at least 3 characters" }),
  pnumber: z.string(),
  store_owner: z.string().min(3, { message: "Owner name must be at least 3 characters" }),
  ownerID: z.string().min(8, { message: "Owner ID must be at least 8 characters" }),
  tax_clearance: z.string().min(3, { message: "Tax clearance must be at least 3 characters" }),
})

interface PlaceData {
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
}

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const [isLoading, setIsloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [number, setNumber] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      store_owner: '',
      pnumber: number,
      ownerID: '',
      tax_clearance: ''
    }
  })

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Temporarily disabled Google Places autocomplete
  // const getPlaceDetails = (place: google.maps.places.PlaceResult | null) => {
  //   if (place) {
  //     const name = place.name || '';
  //     const formatted_address = place.formatted_address || '';
  //     const latitude = place.geometry?.location?.lat() || 0;
  //     const longitude = place.geometry?.location?.lng() || 0;
  //
  //     const data = { name, formatted_address, latitude, longitude };
  //     setPlaceData(data);
  //     return data;
  //   }
  //   return null;
  // }
  //
  // const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult | null) => {
  //   const details = getPlaceDetails(place);
  //   if (details) {
  //     // Update the form value so the input reflects the selected address
  //     form.setValue('address', details.formatted_address, { shouldValidate: true, shouldDirty: true });
  //   }
  // }, [form])

  const onSumbit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsloading(true);
      const data = {
        ...values,
        number: number,
        // ...(placeData && {
        //   latitude: placeData.latitude,
        //   longitude: placeData.longitude,
        //   formatted_address: placeData.formatted_address,
        //   place_name: placeData.name,
        // })
      }
      const response = await axios.post("/api/stores", data);
      toast.success("Store Created");
      window.location.assign(`/${response.data.id}`)
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsloading(false)
    }
  };

  if (!isMounted) return null;

  return (
    <Modal
      title="Create a new Store"
      description="Add a new store to duplicate your on-premise infrastructure online!"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="rounded-xl shadow-xl overflow-hidden border border-primary/20 bg-accent/30">
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-1">Store Information</h2>
              <p className="text-sm text-muted-foreground">Fill in your store details to get started</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSumbit)} className="space-y-6">
                {/* Address first with Google Autocomplete */}
                <div className="p-4 rounded-lg border border-primary/20 bg-white/60">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Store Address</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Enter store address (Google Autocomplete temporarily disabled)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Auto-filled store location - temporarily disabled */}
                <div className="p-4 rounded-lg border border-primary/20 bg-white/60">
                  <FormLabel className="text-foreground block mb-2">Store Location</FormLabel>
                  <p className="text-sm text-muted-foreground">Google Autocomplete temporarily disabled. Enter address manually.</p>
                </div>

                {/* Other fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name"
                    render={({ field }) => (
                      <FormItem className="p-4 rounded-lg border border-primary/20 bg-white/60">
                        <FormLabel className="text-foreground">Store Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="bg-white/80 border-border focus:ring-primary focus:border-primary ring-offset-background"
                            placeholder="Your Store Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="store_owner"
                    render={({ field }) => (
                      <FormItem className="p-4 rounded-lg border border-primary/20 bg-white/60">
                        <FormLabel className="text-foreground">Owner Full Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="bg-white/80 border-border focus:ring-primary focus:border-primary ring-offset-background"
                            placeholder="Your Full Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="pnumber"
                    render={({ field }) => (
                      <FormItem className="p-4 rounded-lg border border-primary/20 bg-white/60">
                        <FormLabel className="text-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            className="w-full p-3 bg-white/80 rounded-md border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder="Enter phone number"
                            onChange={(value) => { setNumber(value ? value.toString() : ''); field.onChange(value) }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="ownerID"
                    render={({ field }) => (
                      <FormItem className="p-4 rounded-lg border border-primary/20 bg-white/60">
                        <FormLabel className="text-foreground">Owner ID</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="bg-white/80 border-border focus:ring-primary focus:border-primary ring-offset-background"
                            placeholder="Your ID Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField control={form.control} name="tax_clearance"
                  render={({ field }) => (
                    <FormItem className="p-4 rounded-lg border border-primary/20 bg-white/60">
                      <FormLabel className="text-foreground">Tax Clearance</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-white/80 border-border focus:ring-primary focus:border-primary ring-offset-background"
                          placeholder="Tax clearance number/reference"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20" disabled={isLoading}>
                  {isLoading ? "Creating store..." : "Create Store"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  )
}