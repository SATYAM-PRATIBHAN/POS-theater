"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isUser, setIsUser] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    const userStatus = localStorage.getItem("isUser");
    
    if (adminStatus === "true") {
      setIsAdmin(true);
    } else if (userStatus === "true") {
      setIsUser(true);
    } else {
      router.push("/signin");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isUser");
    router.push("/signin");
  };

  if (isAdmin === null && isUser === null) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">{isAdmin ? "Admin Dashboard" : "User Dashboard"}</h1>
      <div className={`grid ${isAdmin ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"} gap-6 w-full max-w-2xl justify-center`}> 
        {isAdmin && (
          <>
            {/* Admin Add Item */}
            <Link
              href="/admin-add-item"
              className="block bg-white p-6 rounded-lg shadow-lg text-center hover:bg-gray-200 transition"
            >
              <h2 className="text-xl font-semibold">Add Item</h2>
              <p className="text-gray-600 text-sm">Add new items to the menu.</p>
            </Link>
            
            {/* Admin Orders */}
            <Link
              href="/admin-orders"
              className="block bg-white p-6 rounded-lg shadow-lg text-center hover:bg-gray-200 transition"
            >
              <h2 className="text-xl font-semibold">Orders</h2>
              <p className="text-gray-600 text-sm">View and manage orders.</p>
            </Link>
          </>
        )}
        
        {/* Items List - Visible to both Admin and User */}
        <Link
          href="/items"
          className="block bg-white p-6 rounded-lg shadow-lg text-center hover:bg-gray-200 transition"
        >
          <h2 className="text-xl font-semibold">Items</h2>
          <p className="text-gray-600 text-sm">View available items.</p>
        </Link>
      </div>
      <button 
        onClick={handleLogout} 
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}