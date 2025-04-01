"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  name: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const isAdmin = localStorage.getItem("isAdmin");
        const isUser = localStorage.getItem("isUser");
        if (isAdmin === "false" && isUser === "true") {
          alert("Unauthorized");
          router.push("/signin");
        }
        if (isUser === "true") {
          router.push("/items");
        }

        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const markAsDelivered = async (seatNumber: string) => {
    const confirmDelete = confirm("Are you sure you want to mark all orders for this seat as delivered?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/orders?seatNumber=${seatNumber}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.seatNumber !== seatNumber));
        alert("Orders marked as delivered!");
      } else {
        alert("Failed to delete orders.");
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading orders...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found.</div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">
                      {order.customerName}
                    </h2>
                    <p className="text-sm text-gray-500">Seat: {order.seatNumber}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm border-t pt-2"
                    >
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-gray-500">Size: {item.size}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => markAsDelivered(order.seatNumber)}
                  className="mt-4 bg-green-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-green-700 transition w-fit"
                >
                  Mark as Delivered
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="ml-[38%] mt-6 w-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}
