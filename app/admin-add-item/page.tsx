"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Variant {
  size: string;
  price: number;
  stock: number;
}

export default function AddItemPage() {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("Beverages");
  const [variants, setVariants] = useState<Variant[]>([{ size: "S", price: 0, stock: 0 }]);
  const router = useRouter()

  const handleButton = () => {
    router.push("/")
  }
  

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants];
    if (field === "price" || field === "stock") {
      newVariants[index][field] = Number(value); // Convert to number
    } else {
      newVariants[index][field] = value;
    }
    setVariants(newVariants);
  };
  

  const addVariant = () => {
    setVariants([...variants, { size: "", price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure "M" and "L" sizes exist with default values if not specified
    const sizes = ["S", "M", "L"];
    const updatedVariants = [...variants];

    sizes.forEach((size) => {
        if (!updatedVariants.some((variant) => variant.size.toUpperCase() === size)) {
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
        setVariants([{ size: "S", price: 0, stock: 0 }]); // Reset to default
    } else {
        alert("Failed to add item.");
    }
};


  return (
    <div className="flex justify-center items-center h-screen">
        <div className="max-w-md w-full p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block font-semibold">Item Name</label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
                />
            </div>

            <div>
                <label className="block font-semibold">Category</label>
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
                >
                <option value="Beverages">Beverages</option>
                <option value="Food">Food</option>
                <option value="Misc">Misc</option>
                </select>
            </div>

            <div>
                <label className="block font-semibold">Variants</label>
                {variants.map((variant, index) => (
                <div key={index} className="flex gap-2 mb-2">
                    <input
                    type="text"
                    placeholder="Size (S, M, L)"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                    className="w-1/3 p-2 border rounded"
                    required
                    />
                    <input
                    type="number"
                    placeholder="Price"
                    value={variant.price || ""}
                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                    className="w-1/3 p-2 border rounded"
                    required
                    />
                    <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock || ""}
                    onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                    className="w-1/3 p-2 border rounded"
                    required
                    />
                    {index > 0 && (
                    <button type="button" onClick={() => removeVariant(index)} className="text-red-500">
                        ✖
                    </button>
                    )}
                </div>
                ))}
                <button type="button" onClick={addVariant} className="mt-2 text-blue-500">
                + Add Variant
                </button>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                Add Item
            </button>
            </form>
            <button onClick={handleButton} type="submit" className="w-full bg-red-600 text-white p-2 rounded">
                Go To HomePage
            </button>
        </div>
        </div>
  );
}
