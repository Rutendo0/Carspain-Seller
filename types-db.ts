import { Timestamp } from "firebase/firestore";

export interface Store {
    id: string;
    name: string;
    address: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export interface Billboards {
    id: string;
    label: string;
    imageUrl: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export interface Category {
    id: string;
    billboardId: string;
    billboardLabel: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Model {
    id: string;
    brandId: string;
    brandLabel: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export interface Industry {
    id: string;
    name: string;
    value: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Brand {
    id: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Product {
    id: string;
    name: string;
    OEM: string;
    price: number;
    qty?: number;
    stock: number;
    images: {url: string}[];
    isFeatured?: boolean;
    isArchived: boolean;
    category: string;
    industry: string;
    brand: string;
    model: string;
    year: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    inventory: number;
}

export interface Order {
    id: string;
    isPaid: boolean;
    phone: string,
    orderItems: Product[],
    address: string,
    store_address: string,
    order_status: string,
    createdAt: Timestamp;
    updatedAt: Timestamp;
    approved: string;
    store_id: string;
}

export interface Review {
    id: string;
    comment: string;
    userID: string;
    userName: string;
    productID: string;
    createdAt: Timestamp;

}
export interface ReturnData {
    id?: string; // This will be added when the document is created in Firestore
    orderId: string;
    userId: string;
    originalOrder: Order;
    description: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected' | 'processed' | 'delivering' | 'returned'; 
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    returnDeadline: string;
}

export interface Wishlist {
    product: string,
    userId: string,
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export interface Part {
    id: string,
    Name: string,
    PartCode: string,
    Category: string,
    Make: string,
    Model: string,
    Year: number,
    Photo: string,
    createdAt: Timestamp;
    updatedAt: Timestamp;

}