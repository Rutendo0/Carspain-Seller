"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ProductColumns, columns } from "./columns";
import ApiList from "@/components/api_list";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Select from "react-select"; // Import react-select

interface ProductClientProps {
  data: ProductColumns[];
  email: string | undefined;
  uname: string | null | undefined;
}

export const ProductClient = ({ data, email, uname }: ProductClientProps) => {
  const params = useParams();
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [LOADING, setIsLoading] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Example car makes and years
  const carMakes = [
    "CITROEN", "Chevrolet", "Mitsubishi", "VW", "HONDA", "TIRE", "Subaru", "Renault", "VOLVO", 
    "Mitsubishi Fuso", "FORD", "MCC", "SAAB", "MERCEDES-BENZ", "Zil", "Landrover", "ISUZU", 
    "SUBARU", "Lexus", "Kia", "Porsche", "Infiniti", "Hyundai", "Fiat", "AUDI", "ROVER", 
    "TOYOTA", "Mazda", "Maserati", "PEUGEOT", "JAGUAR", "Mitsuoka", "CHEVROLET", "DAIHATSU", 
    "VOLKSWAGEN", "MITSUBISHI", "LEXUS", "ALFA ROMEO", "MAZDA", "Honda", "Jaguar", "Toyota", 
    "Volvo", "BMW", "Ssangyong", "HYUNDAI", "HINO", "Acura", "CHRYSLER", "Lancia", "BENTLEY", 
    "BMW Mini", "DAIMLER", "Rolls-Royce", "NISSAN", "SUZUKI", "Other All", "GM", "OPEL", "KIA", 
    "Nissan", "Mopar", "TRAILER", "Audi"
  ];

  const years = [
    "2098", "2097", "2096", "2095", "2093", "2090", "2089", "2087", "2086", "2083", "2082",
    "2079", "2078", "2077", "2076", "2074", "2072", "2071", "2070", "2069", "2068", "2064",
    "2063", "2061", "2060", "2059", "2058", "2057", "2056", "2055", "2054", "2051", "2050",
    "2049", "2048", "2047", "2046", "2043", "2042", "2041", "2040", "2038", "2037", "2035",
    "2034", "2033", "2031", "2030", "2029", "2028", "2027", "2025", "2024", "2023", "2022",
    "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011",
    "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000",
    "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990", "1989",
    "1988", "1987", "1986", "1985", "1984", "1983", "1982", "1981", "1980", "1979", "1978",
    "1977", "1976", "1975", "1974", "1973", "1972", "1971", "1970", "1969", "1968", "1967",
    "1965", "1964", "1962", "1961", "1960", "1959", "1958", "1957", "1955", "1954", "1952",
    "1950", "1949", "1947", "1946", "1943", "1942", "1941", "1937", "1936", "1935", "1934",
    "1933", "1932", "1931", "1930", "1929", "1928", "1926", "1925", "1924", "1923", "1922",
    "1921", "1920", "1919", "1917", "1916", "1915", "1914", "1913", "1912", "1910", "1908",
    "1907", "1906", "1905", "1904", "1902", "1901", "1900"
  ];
  
  

  // Handle low stock notifications
  for (const x of data) {
    if (x.stock < 5) {
      emailjs
        .send(
          "service_miw5uzq",
          "template_pclaerv",
          {
            to_email: email,
            message: `Your stock is running low for ${x.name}, ${x.model} ${x.brand}, ${x.year}. Please replenish to ensure product stays visible on the marketplace.`,
            from_name: "Carspian Auto",
            to_name: uname,
          },
          "NgwZzNEQN_63SAnSw"
        )
        .then(
          (result) => {},
          (error) => {
            console.log(error.text);
            toast.error("Failed to send email notification. Please contact admin.");
          }
        );
    }
  }

  // Handle "Add New" button click
  const handleAddNewClick = () => {
    setIsPopupOpen(true);
  };

  // Handle "Proceed" button click in the popup
  const handleProceed = () => {
    if (selectedMake && selectedYear) {
      setIsLoading(true);
      router.push(`/${params.storeId}/products/new?make=${selectedMake}&year=${selectedYear}`);
      setIsLoading(false);
    } else {
      toast.error("Please select both a make and a year.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Products (${data.length})`} description="Manage products for your store" />
        <Button onClick={handleAddNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />

      {process.env.NEXT_PUBLIC_SHOW_API_DOCS === 'true' && (
        <>
          <Heading title="API" description="API calls for products" />
          <Separator />
          <ApiList entityName="products" entityId="productId" />
        </>
      )}

      {/* Popup for selecting make and year */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="m-4">
              <Label>Select Make</Label>
              <Select
                options={carMakes.map((make) => ({ value: make, label: make }))}
                onChange={(selectedOption) => setSelectedMake(selectedOption?.value || null)}
                placeholder="Select a make"
                isSearchable // Enable search functionality
              />
            </div>
            <div className="m-4">
              <Label>Select Year</Label>
              <Select
                options={years
                  .filter((year) => parseInt(year) >= 1980 && parseInt(year) <= 2025)
                  .map((year) => ({ value: year, label: year }))}
                onChange={(selectedOption) => setSelectedYear(selectedOption?.value || null)}
                placeholder="Select a year"
                isSearchable // Enable search functionality
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleProceed} disabled={LOADING || !selectedMake || !selectedYear}>
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};