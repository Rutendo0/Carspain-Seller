import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { Brand, Category, Industry, Model, Part, Product, Review } from "@/types-db";
import { ProductForm } from "./_components/product-form";
import { useState } from "react";

const ProductPage = async ({
  params,
  searchParams, // Access query parameters here
}: {
  params: Promise<{ storeId: string; productId: string }>;
  searchParams: Promise<{ make?: string; year?: string }>; // Define expected query parameters
}) => {
  const { storeId, productId } = await params;
  const { make, year } = await searchParams;


  // Fetch product data
  const product = (
    await getDoc(doc(db, "stores", storeId, "products", productId))
  ).data() as Product;

  // Fetch reviews data
  const categoryData = (
    await getDocs(
      query(
        collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "reviews"),
        where("productID", "==", productId)
      )
    )
  ).docs.map((doc) => doc.data()) as Review[];

  // Access make and year from query parameters
  // Already awaited above
  console.log(make, year);

  // Fetch parts data based on make and year
  const startTime = performance.now(); // Start timing the request
  const partsData = (
    await getDocs(
      query(
        collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "parts2"),
        where("Make", "==", make || ""), // Use make from query params
        where("Year", "==", year || "") // Use year from query params
      )
    )
  ).docs.map((doc) => doc.data()) as Part[];
  const endTime = performance.now(); // End timing the request
  console.log(`Query took ${endTime - startTime} milliseconds.`);

  // Fetch industries data
  const industriesData = (
    await getDocs(collection(doc(db, "data", "wModRJCDon6XLQYmnuPT"), "industries"))
  ).docs.map((doc) => doc.data()) as Industry[];

  // Function to calculate time elapsed
  const timeElapsed = (createdAt: Timestamp) => {
    if (createdAt) {
      const now = new Date().getTime();
      const created = new Date(createdAt.seconds * 1000).getTime();
      const diff = now - created;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} day(s) ago`;
      } else if (hours > 0) {
        return `${hours} hour(s) ago`;
      } else if (minutes > 0) {
        return `${minutes} minute(s) ago`;
      } else {
        return `${seconds} second(s) ago`;
      }
    }
  };

  // Set confirm state based on partsData


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Conditional Rendering */}
      {partsData.length > 0 ? (
        <ProductForm
          initialData={product}
          industries={industriesData}
          parts={partsData}
        />
      ) : (
        <p className="text-3xl text-center m-8 font-bold text-gray-500">No {make} {year} Parts, Sorry!</p>
      )}

      {/* Reviews Section */}
      <div className="w-full mt-4 mb-4">
        {categoryData.map((review) => (
          <div
            key={review.id}
            className="w-full h-fit-content max-h-[300px] bg-gray-100 bg-opacity-50 overflow-y-auto rounded-md border border-gray-100 p-4"
          >
            <h2 className="text-blue-400 text-xs p-2 rounded-md w-fit-content">
              {review.userName}
            </h2>
            <p className="text-gray-500 bg-white shadow-md pl-8 p-2 m-2 rounded-md">
              {review.comment}
            </p>
            <p className="text-gray-400 text-xs">
              Added: {timeElapsed(review.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;