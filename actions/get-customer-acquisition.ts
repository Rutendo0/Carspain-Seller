// get-customer-acquisition.ts
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getCustomerAcquisition = async (storeId: string) => {
  // Get total new customers count
  const customersQuery = query(
    collection(db, `stores/${storeId}/customers`),
    where("isNew", "==", true)
  );
  const customersSnapshot = await getDocs(customersQuery);
  const newCustomers = customersSnapshot.size;

  // Get monthly customer acquisition data (simplified example)
  const monthlyData = [
    { month: 'Jan', newCustomers: 12 },
    { month: 'Feb', newCustomers: 19 },
    { month: 'Mar', newCustomers: 15 },
    { month: 'Apr', newCustomers: 22 },
    { month: 'May', newCustomers: 18 },
    { month: 'Jun', newCustomers: 25 },
  ];

  return { newCustomers, monthlyData };
};