"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Variant {
  size: string;
  price: number;
  stock: number;
}

export default function AddItemPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Beverages");
  const [variants, setVariants] = useState<Variant[]>([{ size: "S", price: 0, stock: 0 }]);
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const isUser = localStorage.getItem("isUser");
    if (isAdmin === "false" && isUser === "true") {
      alert("Unauthorized");
      router.push("/signin");
    }
    if (isUser === "true") {
      router.push("/items");
    }
  }, []);

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants];
    if (field === "price" || field === "stock") {
      newVariants[index][field] = Number(value);
    } else {
      newVariants[index][field] = value;
    }
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { size: "", price: 0, stock: 0 }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = ["S", "M", "L"];
    const updatedVariants = [...variants];
    
    sizes.forEach((size) => {
      if (!updatedVariants.some((v) => v.size.toUpperCase() === size)) {
        updatedVariants.push({ size, price: 0, stock: 0 });
      }
    });

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, variants: updatedVariants }),
    });

    if (response.ok) {
      alert("Item added successfully!");
      setName("");
      setCategory("Beverages");
      setVariants([{ size: "S", price: 0, stock: 0 }]);
    } else {
      alert("Failed to add item.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Beverages">Beverages</option>
              <option value="Food">Food</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Variants</label>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                  className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price || ""}
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock || ""}
                  onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                  className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Item
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}