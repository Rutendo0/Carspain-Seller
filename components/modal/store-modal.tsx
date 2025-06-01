"use client"

import { z } from "zod";
import { Modal } from "../modal";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import 'react-phone-number-input/style.css'
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios"
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";
import PhoneInput from 'react-phone-number-input'
import { APIProvider, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

const API_KEY = "AIzaSyCMS_WYq8t__XIfr15wGxuNYIdjCA52Xy8"

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
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
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

    const getPlaceDetails = (place: google.maps.places.PlaceResult | null) => {
        if (place) {
            const name = place.name || '';
            const formatted_address = place.formatted_address || '';
            const latitude = place.geometry?.location?.lat() || 0;
            const longitude = place.geometry?.location?.lng() || 0;
            
            const data = {
                name,
                formatted_address,
                latitude,
                longitude
            }
            
            setPlaceData(data)
            return data
        }
        return null
    }

    const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
        setSelectedPlace(place)
        const details = getPlaceDetails(place)
        if (details) {
            form.setValue('address', details.formatted_address)
        }
    }

    const onSumbit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsloading(true);
            const data = {
                ...values,
                number: number,
                ...(placeData && {
                    latitude: placeData.latitude,
                    longitude: placeData.longitude
                })
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

    if(!isMounted) {
        return null
    }

    const PlaceAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) => {
        const [placeAutocomplete, setPlaceAutocomplete] = 
            useState<google.maps.places.Autocomplete | null>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const places = useMapsLibrary('places');
    
        useEffect(() => {
            if (!places || !inputRef.current) return;
    
            const options = {
                fields: ['geometry', 'name', 'formatted_address']
            };
    
            const autocomplete = new places.Autocomplete(inputRef.current, options);
            setPlaceAutocomplete(autocomplete);
    
            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('pac-item')) {
                    setTimeout(() => {
                        const place = autocomplete.getPlace();
                        onPlaceSelect(place);
                    }, 0);
                }
            };
    
            const container = inputRef.current.parentElement;
            if (container) {
                container.addEventListener('click', handleClick);
            }
    
            return () => {
                if (container) {
                    container.removeEventListener('click', handleClick);
                }
            };
        }, [places, onPlaceSelect]);
    
        useEffect(() => {
            if (!placeAutocomplete) return;
    
            placeAutocomplete.addListener('place_changed', () => {
                const place = placeAutocomplete.getPlace();
                onPlaceSelect(place);
            });
    
            return () => {
                if (placeAutocomplete) {
                    google.maps.event.clearInstanceListeners(placeAutocomplete);
                }
            };
        }, [onPlaceSelect, placeAutocomplete]);
    
        return (
            <div className="autocomplete-container">
                <input 
                    ref={inputRef} 
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Search for store location"
                />
            </div>
        );
    };

    return(
        <Modal 
            title="Create a new Store"
            description="Add a new store to duplicate your on-premise infrastructure online!"
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
        >
            <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="backdrop-blur-lg bg-white/30 rounded-xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Information</h2>
                        <p className="text-gray-600 mb-6">Fill in your store details to get started</p>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSumbit)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField control={form.control} name="name"
                                    render={({field}) => (
                                        <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                            <FormLabel className="text-gray-700 font-medium">Store Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={isLoading}
                                                    className="bg-white/70 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Your Store Name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs"/>
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="store_owner"
                                    render={({field}) => (
                                        <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                            <FormLabel className="text-gray-700 font-medium">Owner Full Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={isLoading}
                                                    className="bg-white/70 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Your Full Name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs"/>
                                        </FormItem>
                                    )}/>
                                </div>

                                <div className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                    <FormLabel className="text-gray-700 font-medium block mb-3">Store Location</FormLabel>
                                    <APIProvider apiKey={API_KEY}>
                                        <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                                        {selectedPlace && (
                                            <div className="mt-3 p-3 rounded-lg bg-white/70 border border-gray-200">
                                                <p className="font-medium text-gray-800">{selectedPlace.name}</p>
                                                <p className="text-sm text-gray-600">{selectedPlace.formatted_address}</p>
                                                {placeData && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Coordinates: {placeData.latitude.toFixed(6)}, {placeData.longitude.toFixed(6)}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </APIProvider>
                                </div>

                                <FormField 
                                    control={form.control} 
                                    name="address"
                                    render={({field}) => (
                                        <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                            <FormLabel className="text-gray-700 font-medium">Store Address</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={isLoading}
                                                    className="bg-white/70 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Your Store Address"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs"/>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField control={form.control} name="pnumber"
                                    render={({field}) => (
                                        <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                            <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    {...field}
                                                    className="w-full p-3 bg-white/70 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Enter phone number"
                                                    onChange={(value) => { setNumber(value ? value.toString() : ''); }}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs"/>
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="ownerID"
                                    render={({field}) => (
                                        <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                            <FormLabel className="text-gray-700 font-medium">Owner ID</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={isLoading}
                                                    className="bg-white/70 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Owner's ID Number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs"/>
                                        </FormItem>
                                    )}/>
                                </div>

                                <FormField control={form.control} name="tax_clearance"
                                render={({field}) => (
                                    <FormItem className="backdrop-blur-sm bg-white/50 p-4 rounded-lg border border-white/20 shadow-sm">
                                        <FormLabel className="text-gray-700 font-medium">Tax Clearance Code</FormLabel>
                                        <FormControl>
                                            <Input 
                                                disabled={isLoading}
                                                className="bg-white/70 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Tax Clearance for this Shop"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs"/>
                                    </FormItem>
                                )}/>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <Button 
                                        disabled={isLoading}  
                                        type="button" 
                                        variant={"outline"} 
                                        className="border-gray-300 text-gray-700 hover:bg-gray-100/80"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        disabled={isLoading} 
                                        type="submit" 
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                                    >
                                        {isLoading ? 'Creating...' : 'Create Store'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
