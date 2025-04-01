"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const Navbar = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
    const router = useRouter()
    const handleLogout = () => {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("isUser");
        router.push("/signin");
    };

    useEffect(() => {
        const adminStatus = localStorage.getItem("isAdmin");

        if (adminStatus === "true") {
            setIsAdmin(true);
        } 
    })
    return (
        <>
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
        </>
    )
}

export default Navbar;
