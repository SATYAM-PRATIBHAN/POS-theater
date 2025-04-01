"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  name : string
  id: string;
  size: string;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  seatNumber: string;
  items: OrderItem[];
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {

    
    const fetchOrders = async () => {
      try {
        const isAdmin = localStorage.getItem("isAdmin");
        const isUSer = localStorage.getItem("isUser")
        if (isAdmin === "false" && isUSer === "true") {
          alert("Unauthorized")
          router.push("/signin");
        }
        if (isUSer === "true"){
          router.push("/items");
        }

        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log(data);
        setOrders(data.orders || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="border p-4 rounded shadow-md">
              <p className="font-semibold">Customer: {order.customerName}</p>
              <p>Seat: {order.seatNumber}</p>
              <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleString()}</p>
              <ul className="mt-2 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-semibold text-blue-500">Item-Ordered : </span>{item.name} <span className="font-semibold text-blue-500">Quantity :</span> {item.quantity} <span className="font-semibold text-blue-500">Size :</span> {item.size} 
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}