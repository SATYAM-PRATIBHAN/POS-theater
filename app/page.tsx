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

  if (isAdmin === null && isUser === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-semibold text-gray-800">
              Welcome, {isAdmin ? "Administrator" : "User"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isAdmin
                ? "Manage your inventory and orders with ease."
                : "Explore our menu and place your order."}
            </p>
          </div>

          <div
            className={`grid ${isAdmin ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1"} gap-6`}
          >
            {isAdmin && (
              <>
                <Link
                  href="/admin-add-item"
                  className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <h3 className="text-xl font-medium text-gray-800">Add Item</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Add new items
                  </p>
                </Link>
                <Link
                  href="/admin-orders"
                  className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <h3 className="text-xl font-medium text-gray-800">Orders</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    View and manage orders.
                  </p>
                </Link>
                <Link
                  href="/items"
                  className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <h3 className="text-xl font-medium text-gray-800">Items</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    View all items.
                  </p>
                </Link>
              </>
            )}
            {isUser && (
              <Link
                href="/items"
                className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 w-full"
              >
                <h3 className="text-2xl font-medium text-center text-gray-800">Browse Items</h3>
                <p className="text-gray-500 text-center text-sm mt-2">
                  Check all Items here
                </p>
              </Link>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}