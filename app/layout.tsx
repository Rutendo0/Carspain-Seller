 import type { Metadata } from "next";
 import { Poppins } from "next/font/google";
 import Script from "next/script";
 import "./globals.css";
 import { AuthProvider } from "@/providers/auth-context";
 import { ModalProvider } from "@/providers/modal-provider";
 import { ToastProvider } from "@/providers/toast-provider";
 
 const poppins = Poppins({ subsets: ["latin"], weight :["100","200","300","400","500","600","700","800","900"] });
 
 export const metadata: Metadata = {
   title: "Auto Parts Marketplace",
   description: "Sell your parts on a single platform",
 };
 
 export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
   return (
     <html lang="en">
       <head>
         {mapsApiKey ? (
           <>
             <Script
               id="gmaps-js"
               src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&v=weekly`}
               strategy="afterInteractive"
             />
             <Script
               id="gmaps-extended-components"
               src="https://unpkg.com/@googlemaps/extended-component-library@0.6/dist/index.min.js"
               strategy="afterInteractive"
             />
           </>
         ) : null}
       </head>
       <body className={poppins.className} suppressHydrationWarning>
         <AuthProvider>
           <ModalProvider />
           <ToastProvider />
           {children}
         </AuthProvider>
       </body>
     </html>
   );
 }
