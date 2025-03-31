"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminCreds = { email: "admin@example.com", password: "admin123" };
    const userCreds = { email: "user@example.com", password: "user123" };
  
    if (
      (role === "admin" && email === adminCreds.email && password === adminCreds.password) ||
      (role === "user" && email === userCreds.email && password === userCreds.password)
    ) {
      alert(`Login successful! Redirecting to ${role} dashboard.`);
  
      if (role === "admin") {
        localStorage.setItem("isUser", "true"); 
        localStorage.setItem("isAdmin", "true");
        router.push("/");
      } else {
        localStorage.setItem("isUser", "true"); 
        localStorage.setItem("isAdmin", "false");
        router.push("/items");
      }
    } else {
      alert("Invalid credentials");
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
